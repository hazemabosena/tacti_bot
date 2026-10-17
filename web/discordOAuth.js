const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { rateLimit } = require("express-rate-limit");
const { ChannelType, PermissionsBitField } = require("discord.js");
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

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
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

function createDiscordOAuthRouter({ client, db }) {
  const router = express.Router();
  const redirectUri = process.env.DISCORD_OAUTH_REDIRECT_URI;
  const sessionSecret = process.env.WEB_SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  let redirectOrigin;

  try {
    const redirectUrl = new URL(redirectUri);
    if (isProduction && redirectUrl.protocol !== "https:") {
      throw new Error("HTTPS is required for the OAuth callback in production.");
    }
    redirectOrigin = redirectUrl.origin;
  } catch {
    redirectOrigin = null;
  }

  const configurationIsValid =
    Boolean(process.env.CLIENT_ID) &&
    Boolean(process.env.CLIENT_SECRET) &&
    Boolean(redirectOrigin) &&
    typeof sessionSecret === "string" &&
    sessionSecret.length >= 32;

  if (!configurationIsValid) {
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
        client,
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
  router.get(
    "/auth/discord",
    authRateLimit,
    asyncRoute(async (req, res) => {
      const state = crypto.randomBytes(32).toString("hex");
      req.session.oauthState = state;
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
      const expectedState = req.session.oauthState;
      const receivedState = req.query.state;
      delete req.session.oauthState;

      if (
        typeof expectedState !== "string" ||
        typeof receivedState !== "string" ||
        expectedState.length !== receivedState.length ||
        !crypto.timingSafeEqual(Buffer.from(expectedState), Buffer.from(receivedState))
      ) {
        await saveSession(req);
        return res.status(400).json({ error: "Invalid OAuth state." });
      }

      if (req.query.error || typeof req.query.code !== "string") {
        await saveSession(req);
        return res.status(400).json({ error: "Discord authorization was not completed." });
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
        !profile.id
      ) {
        throw httpError(502, "Discord returned an incomplete OAuth response.");
      }

      await regenerateSession(req);
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

  router.post("/auth/logout", authRateLimit, requireSameOrigin, (req, res, next) => {
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

  router.get("/api/me", requireAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
  });

  router.get("/api/languages", (req, res) => {
    res.json({ languages: Object.keys(languages) });
  });

  router.get(
    "/api/guilds",
    requireAuthenticated,
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
    requireAuthenticated,
    asyncRoute(async (req, res) => {
      await requireManageGuild(req, req.params.guildId);
      const settings = await getGuildConfig(req.params.guildId);
      res.json({ settings });
    })
  );

  router.get(
    "/api/guilds/:guildId/resources",
    requireAuthenticated,
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
    requireAuthenticated,
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
      if (!channels.has(channelId) || channels.get(channelId).type !== ChannelType.GuildText) {
        throw httpError(400, "channelId must identify a text channel in this server.");
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
    requireAuthenticated,
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
    res.status(status).json({
      error: status >= 500 ? "The request could not be completed." : error.message,
    });
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
    if (!accessToken) throw httpError(401, "Please sign in again.");

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
      guild = await client.guilds.fetch(guildId);
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

function requireAuthenticated(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Sign in with Discord to continue." });
  }
  next();
}

function requireSameOrigin(req, res, next) {
  if (req.get("origin") !== new URL(process.env.DISCORD_OAUTH_REDIRECT_URI).origin) {
    return res.status(403).json({ error: "Cross-origin request rejected." });
  }
  next();
}

module.exports = { createDiscordOAuthRouter };
