const path = require("path");
const express = require("express");
const { connectToDatabase, disconnectFromDatabase } = require("../db");
const { createDiscordOAuthRouter } = require("../web/discordOAuth");

function getDevelopmentConfig(env = process.env) {
  const uri = env.TACTIOBOT_DEV_MONGODB_URI;
  const databaseName = env.TACTIOBOT_DEV_MONGODB_DB_NAME;
  const portValue = env.TACTIOBOT_DEV_PORT || "3000";
  const port = Number(portValue);

  if (
    typeof uri !== "string" ||
    uri.trim() !== uri ||
    (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))
  ) {
    throw new Error("Set TACTIOBOT_DEV_MONGODB_URI to a separate development MongoDB URI.");
  }
  if (uri === env.MONGODB_URI) {
    throw new Error("The development MongoDB URI must differ from MONGODB_URI.");
  }
  if (
    typeof databaseName !== "string" ||
    !/^TACTIOPBOT_DEV_[A-Za-z0-9_-]+$/.test(databaseName)
  ) {
    throw new Error("Set TACTIOBOT_DEV_MONGODB_DB_NAME to a database name beginning TACTIOPBOT_DEV_.");
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("TACTIOBOT_DEV_PORT must be a valid local TCP port.");
  }
  if (typeof env.WEB_SESSION_SECRET !== "string" || env.WEB_SESSION_SECRET.length < 32) {
    throw new Error("WEB_SESSION_SECRET must contain at least 32 characters.");
  }

  const googleEnabled = env.TACTIOBOT_DEV_GOOGLE_OAUTH_ENABLED === "true";
  const googleRedirectUri = env.TACTIOBOT_DEV_GOOGLE_OAUTH_REDIRECT_URI;
  const googleClientId = env.TACTIOBOT_DEV_GOOGLE_CLIENT_ID;
  const googleClientSecret = env.TACTIOBOT_DEV_GOOGLE_CLIENT_SECRET;
  if (googleEnabled) {
    if (
      typeof googleClientId !== "string" ||
      googleClientId.trim() !== googleClientId ||
      !googleClientId ||
      typeof googleClientSecret !== "string" ||
      googleClientSecret.trim() !== googleClientSecret ||
      !googleClientSecret
    ) {
      throw new Error("Google OAuth requires TACTIOPBOT_DEV_GOOGLE_CLIENT_ID and TACTIOPBOT_DEV_GOOGLE_CLIENT_SECRET.");
    }

    let callback;
    try {
      callback = new URL(googleRedirectUri);
    } catch {
      throw new Error("Set TACTIOPBOT_DEV_GOOGLE_OAUTH_REDIRECT_URI to the exact local Google callback URI.");
    }
    if (
      callback.origin !== `http://localhost:${port}` ||
      callback.pathname !== "/auth/google/callback" ||
      callback.search ||
      callback.hash ||
      callback.username ||
      callback.password
    ) {
      throw new Error("The development Google callback must match this local server and /auth/google/callback.");
    }
  }

  return {
    uri,
    databaseName,
    port,
    googleEnabled,
    googleRedirectUri,
    googleClientId: googleEnabled ? googleClientId : undefined,
    googleClientSecret: googleEnabled ? googleClientSecret : undefined,
  };
}

async function startWebsiteOnlyServer(config) {
  process.env.NODE_ENV = "development";
  process.env.GOOGLE_OAUTH_ENABLED = config.googleEnabled ? "true" : "false";
  if (config.googleEnabled) {
    process.env.GOOGLE_CLIENT_ID = config.googleClientId;
    process.env.GOOGLE_CLIENT_SECRET = config.googleClientSecret;
    process.env.GOOGLE_OAUTH_REDIRECT_URI = config.googleRedirectUri;
  } else {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_OAUTH_REDIRECT_URI;
  }

  const connection = await connectToDatabase({
    uri: config.uri,
    databaseName: config.databaseName,
  });
  const app = express();
  app.use((req, res, next) => {
    res.set({
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    next();
  });
  app.use(express.static(path.resolve(__dirname, "..", "public")));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "public", "index.html"));
  });
  app.use(createDiscordOAuthRouter({
    ...connection,
    websiteOnly: true,
    googleRedirectUriOverride: config.googleEnabled ? config.googleRedirectUri : undefined,
  }));
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  const server = app.listen(config.port, "127.0.0.1", () => {
    console.log(`[website-dev] Local website listening on http://localhost:${config.port}`);
    console.log(`[website-dev] Google sign-in ${config.googleEnabled ? "enabled" : "disabled"}.`);
  });
  let shutdownPromise;

  function shutdown(signal) {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await disconnectFromDatabase();
      console.log(`[website-dev] Stopped after ${signal}.`);
    })();
    return shutdownPromise;
  }

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      shutdown(signal).catch((error) => {
        console.error(`[website-dev] Shutdown failed (${error?.name || "Error"}).`);
        process.exitCode = 1;
      });
    });
  }
}

if (require.main === module) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
  try {
    const config = getDevelopmentConfig();
    startWebsiteOnlyServer(config).catch((error) => {
      console.error(`[website-dev] Startup failed (${error?.name || "Error"}).`);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(`[website-dev] Configuration error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { getDevelopmentConfig };
