const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const { MongoStore } = require("connect-mongo");
const { rateLimit } = require("express-rate-limit");
const { ChannelType, PermissionsBitField } = require("discord.js");
const { ObjectId } = require("mongodb");
const {
  getGuildConfig,
  getNextReset,
  setGuildConfig,
  deleteGuildConfig,
} = require("../utils/clanMissionNotifier");
const { languages } = require("../utils/cmNotificationLanguages");

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const DISCORD_API_BASE = "https://discord.com/api/v10";
const GUILD_MANAGEMENT_PERMISSIONS = 8n | 32n;
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication requests. Please try again later." },
});
const writeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many settings changes. Please try again later." },
});
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." },
});

function httpError(status, message, code) {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function isDiscordSnowflake(value) {
  return typeof value === "string" && /^\d{17,20}$/.test(value);
}

function getRedirectOrigin(value, isProduction) {
  try {
    const url = new URL(value);
    if (url.username || url.password || (isProduction && url.protocol !== "https:")) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isCallbackUri(value, pathname, isProduction) {
  if (!getRedirectOrigin(value, isProduction)) return false;
  const url = new URL(value);
  return url.pathname === pathname && !url.search && !url.hash;
}

function createDiscordOAuthRouter({
  client: mongoClient,
  db,
  discordClient,
  websiteOnly = false,
  googleRedirectUriOverride,
}) {
  const router = express.Router();
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI;
  const sessionSecret = process.env.WEB_SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const redirectOrigin = getRedirectOrigin(redirectUri, isProduction);
  const discordConfigurationIsValid =
    !websiteOnly &&
    hasConfiguredValue(process.env.CLIENT_ID) &&
    hasConfiguredValue(process.env.CLIENT_SECRET) &&
    Boolean(redirectOrigin) &&
    isCallbackUri(redirectUri, "/auth/discord/callback", isProduction) &&
    typeof sessionSecret === "string";
  const googleRedirectUri = googleRedirectUriOverride || process.env.GOOGLE_OAUTH_REDIRECT_URI;
  const googleRedirectOrigin = getRedirectOrigin(googleRedirectUri, isProduction);
  const hasGoogleCredentials =
    hasConfiguredValue(process.env.GOOGLE_CLIENT_ID) &&
    hasConfiguredValue(process.env.GOOGLE_CLIENT_SECRET);
  const googleConfigurationIsValid =
    process.env.GOOGLE_OAUTH_ENABLED === "true" &&
    hasGoogleCredentials &&
    hasConfiguredValue(googleRedirectUri) &&
    Boolean(googleRedirectOrigin) &&
    isCallbackUri(googleRedirectUri, "/auth/google/callback", isProduction) &&
    typeof sessionSecret === "string" &&
    sessionSecret.length >= 32;
  const googleOAuthClient = googleConfigurationIsValid
    ? new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      googleRedirectUri
    )
    : null;
  const sessionConfigurationIsValid =
    Boolean(mongoClient) &&
    Boolean(db) &&
    typeof sessionSecret === "string" &&
    sessionSecret.length >= 32;
  let accountIndexesPromise = null;

  if (!sessionConfigurationIsValid) {
    router.use((req, res) => {
      res.set("Cache-Control", "no-store");
      res.status(503).json({ error: "Website authentication is not configured." });
    });
    return router;
  }

  router.use(
    session({
      name: "tactiobot.sid",
      secret: sessionSecret,
      store: MongoStore.create({
        client: mongoClient,
        dbName: db.databaseName,
        collectionName: "web_sessions",
        ttl: SESSION_MAX_AGE_MS / 1000,
        autoRemove: "native",
      }),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE_MS,
      },
    })
  );

  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  router.use("/api", apiRateLimit);
  router.use("/auth", express.json({ limit: "8kb" }));

  router.get("/auth/providers", (req, res) => {
    res.json({
      discord: discordConfigurationIsValid,
      google: googleConfigurationIsValid,
    });
  });

  async function ensureAccountIndexes() {
    if (!accountIndexesPromise) {
      const accounts = db.collection("web_accounts");
      accountIndexesPromise = Promise.all([
        accounts.createIndex(
          { normalizedEmail: 1 },
          { unique: true, name: "web_accounts_normalized_email_unique" }
        ),
        accounts.createIndex(
          { googleId: 1 },
          {
            unique: true,
            partialFilterExpression: { googleId: { $type: "string" } },
            name: "web_accounts_google_id_unique",
          }
        ),
        accounts.createIndex(
          { discordId: 1 },
          {
            unique: true,
            partialFilterExpression: { discordId: { $type: "string" } },
            name: "web_accounts_discord_id_unique",
          }
        ),
      ]).catch((error) => {
        accountIndexesPromise = null;
        throw error;
      });
    }
    await accountIndexesPromise;
  }

  async function findOrCreateGoogleAccount(profile) {
    await ensureAccountIndexes();
    const accounts = db.collection("web_accounts");
    const normalizedEmail = normalizeEmail(profile.email);
    if (!normalizedEmail) throw httpError(401, "Google returned an invalid email address.");
    let account = await accounts.findOne({ googleId: String(profile.sub) });
    if (account) return account;

    account = await accounts.findOne({ normalizedEmail });
    if (account) throw httpError(409, "An account with this email already exists. Sign in using its original method.");

    try {
      const result = await accounts.insertOne({
        normalizedEmail,
        email: normalizedEmail,
        googleId: String(profile.sub),
        createdAt: new Date(),
      });
      return accounts.findOne({ _id: result.insertedId });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      account = await accounts.findOne({
        $or: [{ googleId: String(profile.sub) }, { normalizedEmail }],
      });
      if (account?.googleId === String(profile.sub)) return account;
      throw httpError(409, "An account with this email already exists.");
    }
  }

  async function linkDiscordAccount(accountId, discordId) {
    if (!ObjectId.isValid(accountId)) {
      throw httpError(401, "Your website account session is invalid. Please sign in again.");
    }
    const accounts = db.collection("web_accounts");
    await ensureAccountIndexes();
    const objectId = new ObjectId(accountId);
    const account = await accounts.findOne({ _id: objectId });
    if (!account) throw httpError(401, "Your website account no longer exists.");
    if (typeof account.googleId !== "string") {
      throw httpError(401, "Sign in with Google before connecting Discord.");
    }

    const existingLink = await accounts.findOne({ discordId });
    if (existingLink && String(existingLink._id) !== String(objectId)) {
      throw httpError(409, "This Discord account is already linked to another website account.");
    }

    try {
      const result = await accounts.updateOne(
        {
          _id: objectId,
          $or: [
            { discordId },
            { discordId: null },
            { discordId: { $exists: false } },
          ],
        },
        { $set: { discordId, updatedAt: new Date() } }
      );
      if (result.matchedCount !== 1) {
        throw httpError(409, "A different Discord account is already linked.");
      }
      return accounts.findOne({ _id: objectId });
    } catch (error) {
      if (error?.code === 11000) {
        throw httpError(409, "This Discord account is already linked to another website account.");
      }
      throw error;
    }
  }

  router.get("/auth/google", authRateLimit, asyncRoute(async (req, res) => {
    if (!googleConfigurationIsValid) {
      throw httpError(503, "Google sign-in is not configured yet.");
    }

    const state = crypto.randomBytes(32).toString("hex");
    const nonce = crypto.randomBytes(32).toString("hex");
    const { codeVerifier, codeChallenge } = await googleOAuthClient.generateCodeVerifierAsync();
    req.session.googleOAuthState = state;
    req.session.googleOAuthNonce = nonce;
    req.session.googleOAuthCodeVerifier = codeVerifier;
    await saveSession(req);
    res.redirect(googleOAuthClient.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }));
  }));

  router.get("/auth/google/callback", authRateLimit, asyncRoute(async (req, res) => {
    if (!googleConfigurationIsValid) {
      throw httpError(503, "Google sign-in is not configured yet.");
    }

    const expectedState = req.session.googleOAuthState;
    const expectedNonce = req.session.googleOAuthNonce;
    const codeVerifier = req.session.googleOAuthCodeVerifier;
    delete req.session.googleOAuthState;
    delete req.session.googleOAuthNonce;
    delete req.session.googleOAuthCodeVerifier;
    if (!matchesOAuthState(expectedState, req.query.state)) {
      await saveSession(req);
      throw httpError(400, "Invalid Google OAuth state.");
    }
    if (
      req.query.error ||
      typeof req.query.code !== "string" ||
      req.query.code.length === 0 ||
      req.query.code.length > 2048 ||
      !expectedNonce ||
      !codeVerifier
    ) {
      await saveSession(req);
      throw httpError(400, "Google authorization was not completed.");
    }

    const { tokens } = await googleOAuthClient.getToken({
      code: req.query.code,
      codeVerifier,
    });
    if (
      typeof tokens.id_token !== "string" ||
      tokens.id_token.length === 0 ||
      tokens.id_token.length > 16_384
    ) {
      throw httpError(502, "Google returned an incomplete sign-in response.");
    }
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();
    if (
      typeof profile?.sub !== "string" ||
      profile.sub.length === 0 ||
      profile.sub.length > 255 ||
      !profile.email ||
      profile.email_verified !== true ||
      profile.nonce !== expectedNonce
    ) {
      throw httpError(401, "Google could not verify this account.");
    }

    let account;
    try {
      account = await findOrCreateGoogleAccount(profile);
    } catch (error) {
      if (error.status === 409) {
        return res.redirect("/?auth_error=google_account_conflict");
      }
      throw error;
    }
    await establishAccountSession(req, account);
    res.redirect("/");
  }));

  router.get(
    "/auth/discord",
    authRateLimit,
    asyncRoute(async (req, res) => {
      if (!discordConfigurationIsValid) {
        throw httpError(503, "Discord sign-in is not configured yet.");
      }
      if (!req.session?.googleAuthenticated || !req.session?.account?.id) {
        throw httpError(401, "Sign in with Google before connecting Discord.");
      }
      const state = crypto.randomBytes(32).toString("hex");
      req.session.oauthState = state;
      req.session.oauthLinkAccountId = req.session.account.id;
      await saveSession(req);

      const authorizationUrl = new URL(`${DISCORD_API_BASE}/oauth2/authorize`);
      authorizationUrl.search = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify guilds",
        state,
      }).toString();

      res.redirect(authorizationUrl.toString());
    })
  );

  router.get(
    "/auth/discord/callback",
    authRateLimit,
    asyncRoute(async (req, res) => {
      if (!discordConfigurationIsValid) {
        throw httpError(503, "Discord sign-in is not configured yet.");
      }
      const expectedState = req.session.oauthState;
      const receivedState = req.query.state;
      const linkAccountId = req.session.oauthLinkAccountId;
      delete req.session.oauthState;
      delete req.session.oauthLinkAccountId;

      if (!matchesOAuthState(expectedState, receivedState)) {
        await saveSession(req);
        return res.status(400).json({ error: "Invalid OAuth state." });
      }

      if (
        !req.session.googleAuthenticated ||
        !req.session.account?.id ||
        linkAccountId !== req.session.account.id
      ) {
        await saveSession(req);
        throw httpError(401, "Sign in with Google before connecting Discord.");
      }

      if (req.query.error) {
        await saveSession(req);
        return res.redirect("/?auth_error=discord_cancelled");
      }
      if (typeof req.query.code !== "string" || req.query.code.length === 0 || req.query.code.length > 2048) {
        await saveSession(req);
        return res.redirect("/?auth_error=discord_cancelled");
      }

      const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw httpError(502, "Discord OAuth token exchange failed.");
      }

      const tokenData = await tokenResponse.json();
      const profileResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!profileResponse.ok) {
        throw httpError(502, "Could not load the Discord user profile.");
      }

      const profile = await profileResponse.json();
      if (
        !tokenData.access_token ||
        !tokenData.refresh_token ||
        !Number.isFinite(tokenData.expires_in) ||
        !isDiscordSnowflake(String(profile.id || ""))
      ) {
        throw httpError(502, "Discord returned an incomplete OAuth response.");
      }

      let linkedAccount;
      try {
        linkedAccount = await linkDiscordAccount(linkAccountId, String(profile.id));
      } catch (error) {
        if (error.status === 409) {
          await saveSession(req);
          return res.redirect("/?auth_error=discord_account_conflict");
        }
        throw error;
      }

      await regenerateSession(req);
      req.session.googleAuthenticated = true;
      req.session.account = toPublicAccount(linkedAccount);
      req.session.user = {
        id: String(profile.id),
        username: String(profile.username || ""),
        globalName: profile.global_name ? String(profile.global_name) : null,
      };
      req.session.oauth = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + tokenData.expires_in * 1000,
      };
      await saveSession(req);
      res.redirect("/");
    })
  );

  router.post("/auth/logout", requireSameOrigin, (req, res, next) => {
    req.session.destroy((error) => {
      if (error) return next(error);
      res.clearCookie("tactiobot.sid", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
      });
      res.status(204).end();
    });
  });

  router.use("/api", express.json({ limit: "8kb" }));

  router.get("/api/me", (req, res) => {
    const googleAuthenticated =
      req.session?.googleAuthenticated === true && Boolean(req.session?.account?.id);
    res.json({
      user: googleAuthenticated && req.session?.oauth?.accessToken ? req.session.user || null : null,
      account: googleAuthenticated ? req.session.account : null,
    });
  });

  router.get("/api/languages", (req, res) => {
    res.json({ languages: Object.keys(languages) });
  });

  if (websiteOnly) {
    router.use("/api", (req, res) => {
      res.status(404).json({ error: "This API is unavailable in the website-only development server." });
    });
  }

  router.get(
    "/api/guilds",
    requireDiscordConnected,
    asyncRoute(async (req, res) => {
      const guilds = await getManageableGuilds(req);
      const result = await Promise.all(
        guilds.map(async (guild) => ({
          id: guild.id,
          name: guild.name,
          clanMissionNotification: await getGuildConfig(guild.id),
        }))
      );
      res.json({ guilds: result });
    })
  );

  router.get(
    "/api/guilds/:guildId/clan-mission-notification",
    requireDiscordConnected,
    asyncRoute(async (req, res) => {
      await requireManageGuild(req, req.params.guildId);
      const settings = await getGuildConfig(req.params.guildId);
      res.json({ settings });
    })
  );

  router.get(
    "/api/guilds/:guildId/resources",
    requireDiscordConnected,
    asyncRoute(async (req, res) => {
      const guildId = req.params.guildId;
      await requireManageGuild(req, guildId);
      const guild = await getBotGuild(guildId);
      const me = guild.members.me || await guild.members.fetchMe();
      const channels = await guild.channels.fetch();
      const roles = await guild.roles.fetch();

      res.json({
        channels: Array.from(channels.values())
          .filter((channel) =>
            channel.type === ChannelType.GuildText &&
            channel.permissionsFor(me)?.has(PermissionsBitField.Flags.SendMessages)
          )
          .map((channel) => ({ id: channel.id, name: channel.name })),
        roles: Array.from(roles.values())
          .filter((role) => role.id !== guild.id && !role.managed)
          .map((role) => ({ id: role.id, name: role.name })),
      });
    })
  );

  router.put(
    "/api/guilds/:guildId/clan-mission-notification",
    requireDiscordConnected,
    requireSameOrigin,
    writeRateLimit,
    asyncRoute(async (req, res) => {
      const guildId = req.params.guildId;
      await requireManageGuild(req, guildId);

      const body = req.body;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError(400, "A JSON settings object is required.");
      }

      const allowedKeys = new Set(["channelId", "roleId", "enabled", "language"]);
      if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
        throw httpError(400, "The settings payload contains unsupported fields.");
      }

      const existing = await getGuildConfig(guildId);
      const channelId = body.channelId === undefined ? existing?.channelId : body.channelId;
      const roleId = body.roleId === undefined ? existing?.roleId ?? null : body.roleId;
      const enabled = body.enabled === undefined ? existing?.enabled ?? true : body.enabled;
      const language = body.language === undefined ? existing?.language || "English" : body.language;

      if (!isDiscordSnowflake(channelId)) {
        throw httpError(400, "channelId must be a Discord channel ID.");
      }
      if (roleId !== null && !isDiscordSnowflake(roleId)) {
        throw httpError(400, "roleId must be a Discord role ID or null.");
      }
      if (typeof enabled !== "boolean") {
        throw httpError(400, "enabled must be a boolean.");
      }
      if (typeof language !== "string" || !Object.prototype.hasOwnProperty.call(languages, language)) {
        throw httpError(400, "language is not supported.");
      }

      const guild = await getBotGuild(guildId);
      const channels = await guild.channels.fetch();
      const channel = channels.get(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        throw httpError(400, "channelId must identify a text channel in this server.");
      }
      const me = guild.members.me || await guild.members.fetchMe();
      if (!channel.permissionsFor(me)?.has(PermissionsBitField.Flags.SendMessages)) {
        throw httpError(400, "The bot must have permission to send messages in this channel.");
      }

      if (roleId !== null) {
        const roles = await guild.roles.fetch();
        if (!roles.has(roleId) || roles.get(roleId).managed) {
          throw httpError(400, "roleId must identify a selectable role in this server.");
        }
      }

      const settings = {
        guildId,
        channelId,
        roleId,
        enabled,
        language,
        nextReset: existing?.nextReset || getNextReset().toISOString(),
      };

      await setGuildConfig(guildId, settings);
      res.json({ settings });
    })
  );

  router.delete(
    "/api/guilds/:guildId/clan-mission-notification",
    requireDiscordConnected,
    requireSameOrigin,
    writeRateLimit,
    asyncRoute(async (req, res) => {
      await requireManageGuild(req, req.params.guildId);
      const deleted = await deleteGuildConfig(req.params.guildId);
      res.json({ deleted });
    })
  );

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) {
      console.error(`[web-api] Request failed (${error?.name || "Error"}).`);
    }
    const message = ["entity.parse.failed", "entity.too.large"].includes(error.type)
      ? "The request body is invalid or too large."
      : status >= 500 ? "The request could not be completed." : error.message;
    const payload = { error: message };
    if (error.code) payload.code = error.code;
    res.status(status).json(payload);
  });

  async function getAccessToken(req) {
    const oauth = req.session.oauth;
    if (!oauth) return null;
    if (oauth.expiresAt > Date.now() + 60_000) return oauth.accessToken;

    if (!oauth.refreshToken) return null;
    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: oauth.refreshToken,
      }),
    });

    if (!response.ok) return null;
    const tokenData = await response.json();
    if (!tokenData.access_token || !tokenData.refresh_token || !Number.isFinite(tokenData.expires_in)) {
      return null;
    }

    req.session.oauth = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };
    await saveSession(req);
    return req.session.oauth.accessToken;
  }

  async function getManageableGuilds(req) {
    const accessToken = await getAccessToken(req);
    if (!accessToken) {
      throw httpError(
        403,
        "Discord connection is required for this feature. Connect Discord to continue.",
        "discord_required"
      );
    }

    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) throw httpError(401, "Please sign in again.");
    if (!response.ok) throw httpError(502, "Could not load Discord server permissions.");

    const guilds = await response.json();
    if (!Array.isArray(guilds)) throw httpError(502, "Discord returned an invalid server list.");

    return guilds.filter((guild) => {
      try {
        return (BigInt(guild.permissions || "0") & GUILD_MANAGEMENT_PERMISSIONS) !== 0n;
      } catch {
        return false;
      }
    });
  }

  async function getBotGuild(guildId) {
    let guild;
    try {
      guild = await discordClient.guilds.fetch(guildId);
    } catch (error) {
      if (error?.status === 403 || error?.status === 404 || error?.code === 10004) {
        throw httpError(403, "The bot must be a member of this Discord server.");
      }
      throw httpError(502, "Could not verify the bot's access to this Discord server.");
    }

    if (!guild) throw httpError(403, "The bot must be a member of this Discord server.");
    return guild;
  }

  async function requireManageGuild(req, guildId) {
    if (!isDiscordSnowflake(guildId)) throw httpError(400, "guildId must be a Discord server ID.");
    const guilds = await getManageableGuilds(req);
    if (!guilds.some((guild) => guild.id === guildId)) {
      throw httpError(403, "You must have Manage Server permission for this Discord server.");
    }
  }

  return router;
}

function requireDiscordConnected(req, res, next) {
  if (
    !req.session?.googleAuthenticated ||
    !req.session?.account?.id ||
    !req.session?.user ||
    !req.session?.oauth?.accessToken
  ) {
    return res.status(403).json({
      error: "Discord connection is required for this feature. Connect Discord to continue.",
      code: "discord_required",
    });
  }
  next();
}

function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    return "";
  }
  return normalizedEmail;
}

function hasConfiguredValue(value) {
  return typeof value === "string" && value.length > 0 && value.trim() === value;
}

function toPublicAccount(account) {
  return {
    id: String(account._id),
    email: account.email,
    displayName: account.displayName || "",
  };
}

function establishAccountSession(req, account) {
  return regenerateSession(req).then(() => {
    req.session.googleAuthenticated = true;
    req.session.account = toPublicAccount(account);
    return saveSession(req);
  });
}

function matchesOAuthState(expected, received) {
  if (typeof expected !== "string" || typeof received !== "string" || expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function requireSameOrigin(req, res, next) {
  const allowedOrigins = new Set([
    getRedirectOrigin(process.env.DISCORD_OAUTH_REDIRECT_URI, process.env.NODE_ENV === "production"),
    getRedirectOrigin(process.env.GOOGLE_OAUTH_REDIRECT_URI, process.env.NODE_ENV === "production"),
  ].filter(Boolean));
  try {
    const host = req.get("host");
    if (!host) throw new Error("Request host is missing.");
    allowedOrigins.add(new URL(`${req.protocol}://${host}`).origin);
  } catch {
    return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  if (!allowedOrigins.has(req.get("origin"))) {
    return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  next();
}

module.exports = { createDiscordOAuthRouter };
