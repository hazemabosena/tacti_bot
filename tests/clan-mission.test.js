const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const Module = require("node:module");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function createMemoryCollection(initialDocuments = []) {
  const documents = new Map(initialDocuments.map((document) => [document._id, clone(document)]));
  return {
    documents,
    async updateOne(filter, update, options = {}) {
      const current = documents.get(filter._id);
      if (current) {
        if (update.$set) documents.set(filter._id, { ...current, ...clone(update.$set) });
        return { acknowledged: true, matchedCount: 1, upsertedCount: 0 };
      }
      if (!options.upsert) return { acknowledged: true, matchedCount: 0, upsertedCount: 0 };

      const document = { _id: filter._id, ...clone(update.$setOnInsert || {}) };
      if (update.$set) Object.assign(document, clone(update.$set));
      documents.set(filter._id, document);
      return { acknowledged: true, matchedCount: 0, upsertedCount: 1 };
    },
    async findOne(filter) {
      return clone(documents.get(filter._id) || null);
    },
    find() {
      return { toArray: async () => Array.from(documents.values(), clone) };
    },
    async deleteOne(filter) {
      return {
        acknowledged: true,
        deletedCount: documents.delete(filter._id) ? 1 : 0,
      };
    },
  };
}

const settingsCollection = createMemoryCollection();
const fakeDatabase = {
  databaseName: "TACTIOPBOT",
  collection: (name) => {
    assert.equal(name, "cm_notification_settings");
    return settingsCollection;
  },
};
const dbPath = require.resolve("../db");
const originalDbModule = require.cache[dbPath];
const fakeDbModule = new Module(dbPath);
fakeDbModule.filename = dbPath;
fakeDbModule.loaded = true;
fakeDbModule.exports = {
  connectToDatabase: async () => ({ configured: true, connected: true, db: fakeDatabase }),
};
require.cache[dbPath] = fakeDbModule;

const notifier = require("../utils/clanMissionNotifier");
const { migrateLegacySettings } = require("../utils/migrateClanMissionSettings");
let sessionState = {};

const sessionModulePath = require.resolve("express-session");
const mongoStoreModulePath = require.resolve("connect-mongo");
const originalSessionModule = require.cache[sessionModulePath];
const originalMongoStoreModule = require.cache[mongoStoreModulePath];
const fakeSessionModule = new Module(sessionModulePath);
fakeSessionModule.filename = sessionModulePath;
fakeSessionModule.loaded = true;
fakeSessionModule.exports = () => (req, res, next) => {
  sessionState.save = (callback) => callback();
  sessionState.regenerate = (callback) => {
    sessionState = {};
    callback();
  };
  sessionState.destroy = (callback) => {
    sessionState = {};
    callback();
  };
  req.session = sessionState;
  next();
};
const fakeMongoStoreModule = new Module(mongoStoreModulePath);
fakeMongoStoreModule.filename = mongoStoreModulePath;
fakeMongoStoreModule.loaded = true;
fakeMongoStoreModule.exports = { create: () => ({}) };
require.cache[sessionModulePath] = fakeSessionModule;
require.cache[mongoStoreModulePath] = fakeMongoStoreModule;
const { createDiscordOAuthRouter } = require("../web/discordOAuth");
if (originalSessionModule) require.cache[sessionModulePath] = originalSessionModule;
else delete require.cache[sessionModulePath];
if (originalMongoStoreModule) require.cache[mongoStoreModulePath] = originalMongoStoreModule;
else delete require.cache[mongoStoreModulePath];

function writeLegacyFixture(data) {
  const filePath = path.join(
    os.tmpdir(),
    `tactiobot-migration-${process.pid}-${crypto.randomBytes(8).toString("hex")}.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(data), "utf8");
  return filePath;
}

test("legacy migration imports settings idempotently and preserves every field", async () => {
  const firstGuild = "12345678901234567";
  const secondGuild = "23456789012345678";
  const original = {
    guilds: {
      [firstGuild]: {
        channelId: "34567890123456789",
        roleId: "45678901234567890",
        enabled: false,
        language: "Arabic",
        nextReset: "2026-10-20T03:00:00.000Z",
        additionalSupportedField: "preserved",
      },
      [secondGuild]: {
        channelId: "56789012345678901",
        roleId: null,
        enabled: true,
        language: "English",
        nextReset: "2026-10-22T03:00:00.000Z",
      },
    },
  };
  const legacyFile = writeLegacyFixture(original);
  const collection = createMemoryCollection();

  try {
    assert.equal(await migrateLegacySettings(collection, legacyFile), 2);
    assert.equal(await migrateLegacySettings(collection, legacyFile), 2);
    assert.equal(collection.documents.size, 2);
    assert.deepEqual(
      collection.documents.get(firstGuild),
      { _id: firstGuild, ...original.guilds[firstGuild], guildId: firstGuild }
    );
    assert.deepEqual(
      collection.documents.get(secondGuild),
      { _id: secondGuild, ...original.guilds[secondGuild], guildId: secondGuild }
    );
    assert.deepEqual(JSON.parse(fs.readFileSync(legacyFile, "utf8")), original);
  } finally {
    fs.unlinkSync(legacyFile);
  }
});

test("legacy migration rejects conflicts without overwriting existing MongoDB settings", async () => {
  const guildId = "34567890123456789";
  const stored = {
    _id: guildId,
    guildId,
    channelId: "45678901234567890",
    roleId: null,
    enabled: true,
    language: "English",
    nextReset: "2026-10-20T03:00:00.000Z",
  };
  const collection = createMemoryCollection([stored]);
  const legacyFile = writeLegacyFixture({
    guilds: {
      [guildId]: { ...stored, channelId: "56789012345678901" },
    },
  });

  try {
    await assert.rejects(migrateLegacySettings(collection, legacyFile), /verification failed/);
    assert.deepEqual(collection.documents.get(guildId), stored);
    assert.equal(fs.existsSync(legacyFile), true);
  } finally {
    fs.unlinkSync(legacyFile);
  }
});

test("legacy migration rejects malformed data and invalid guild identifiers", async () => {
  const invalidShape = writeLegacyFixture({ guilds: [] });
  const invalidGuild = writeLegacyFixture({ guilds: { example: { channelId: "123" } } });
  try {
    await assert.rejects(migrateLegacySettings(createMemoryCollection(), invalidShape), /invalid format/);
    await assert.rejects(migrateLegacySettings(createMemoryCollection(), invalidGuild), /invalid for guild/);
  } finally {
    fs.unlinkSync(invalidShape);
    fs.unlinkSync(invalidGuild);
  }
});

test("notification settings CRUD remains isolated by guild ID", async () => {
  const firstGuild = "45678901234567890";
  const secondGuild = "56789012345678901";
  const firstConfig = {
    guildId: firstGuild,
    channelId: "67890123456789012",
    roleId: null,
    enabled: true,
    language: "English",
    nextReset: "2026-10-20T03:00:00.000Z",
  };
  const secondConfig = {
    ...firstConfig,
    guildId: secondGuild,
    channelId: "78901234567890123",
    language: "Arabic",
  };

  await notifier.setGuildConfig(firstGuild, firstConfig);
  await notifier.setGuildConfig(secondGuild, secondConfig);
  assert.deepEqual(await notifier.getGuildConfig(firstGuild), firstConfig);
  assert.deepEqual(await notifier.getGuildConfig(secondGuild), secondConfig);
  assert.equal((await notifier.getAllGuildConfigs()).length, 2);

  await notifier.updateGuildNextReset(firstGuild, "2026-10-25T03:00:00.000Z");
  assert.equal((await notifier.getGuildConfig(firstGuild)).nextReset, "2026-10-25T03:00:00.000Z");
  assert.equal(await notifier.deleteGuildConfig(firstGuild), true);
  assert.equal(await notifier.deleteGuildConfig(firstGuild), false);
  assert.deepEqual(await notifier.getGuildConfig(secondGuild), secondConfig);
});

test("notification scheduler sends due reminders and advances the due guild reset", async () => {
  const guildId = "67890123456789012";
  const channelId = "78901234567890123";
  const config = {
    guildId,
    channelId,
    roleId: null,
    enabled: true,
    language: "English",
    nextReset: "2000-01-01T00:00:00.000Z",
  };
  await notifier.setGuildConfig(guildId, config);
  let sentMessage = null;
  const client = {
    guilds: {
      fetch: async (requestedGuildId) => ({
        id: requestedGuildId,
        channels: {
          fetch: async (requestedChannelId) => ({
            id: requestedChannelId,
            isTextBased: () => true,
            send: async (message) => { sentMessage = message; },
          }),
        },
      }),
    },
  };
  const { checkAndSendNotifications } = require("../utils/clanMissionScheduler");

  await checkAndSendNotifications(client);

  assert.match(sentMessage, /Clan Missions Reset/);
  assert.ok(new Date((await notifier.getGuildConfig(guildId)).nextReset) > new Date());
});

test("Discord notification command schemas retain their supported options", () => {
  const setCommand = require("../commands/setcmnotif").data.toJSON();
  const editCommand = require("../commands/editcmnotif").data.toJSON();
  const deleteCommand = require("../commands/deletecmnotif").data.toJSON();
  const statusCommand = require("../commands/reminderstatus").data.toJSON();

  assert.deepEqual(setCommand.options.map((item) => item.name), ["channel", "role", "enabled", "language"]);
  assert.deepEqual(editCommand.options.map((item) => item.name), ["channel", "role", "enabled", "language"]);
  assert.equal(deleteCommand.name, "deletecmnotif");
  assert.equal(statusCommand.name, "reminderstatus");
});

test("website OAuth routes fail closed when optional OAuth configuration is absent", async (t) => {
  const keys = ["CLIENT_ID", "CLIENT_SECRET", "DISCORD_OAUTH_REDIRECT_URI", "WEB_SESSION_SECRET"];
  const saved = new Map(keys.map((key) => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];

  const express = require("express");
  const { createDiscordOAuthRouter } = require("../web/discordOAuth");
  const app = express();
  app.use(createDiscordOAuthRouter({}));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/auth/discord`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Website authentication is not configured." });
});

test("OAuth callback rejects invalid state and guild APIs reject unauthorized servers", async (t) => {
  const keys = ["CLIENT_ID", "CLIENT_SECRET", "DISCORD_OAUTH_REDIRECT_URI", "WEB_SESSION_SECRET", "NODE_ENV"];
  const saved = new Map(keys.map((key) => [key, process.env[key]]));
  process.env.CLIENT_ID = "test-client-id";
  process.env.CLIENT_SECRET = "test-client-secret";
  process.env.DISCORD_OAUTH_REDIRECT_URI = "http://localhost/auth/discord/callback";
  process.env.WEB_SESSION_SECRET = "test-session-secret-with-at-least-32-characters";
  process.env.NODE_ENV = "test";
  sessionState = {
    user: { id: "12345678901234567", username: "test-user", globalName: null },
    oauth: {
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
      expiresAt: Date.now() + 10 * 60 * 1000,
    },
  };

  const originalFetch = global.fetch;
  let discordGuilds = [{ id: "23456789012345678", permissions: "0" }];
  global.fetch = async () => new Response(JSON.stringify(discordGuilds), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  const guildId = "23456789012345678";
  const channelId = "34567890123456789";
  const roleId = "45678901234567890";
  const textChannel = {
    id: channelId,
    name: "clan-missions",
    type: 0,
    permissionsFor: () => ({ has: () => true }),
  };
  const guild = {
    id: guildId,
    members: { me: { id: "56789012345678901" }, fetchMe: async () => ({ id: "56789012345678901" }) },
    channels: { fetch: async () => new Map([[channelId, textChannel]]) },
    roles: {
      fetch: async () => new Map([
        [guildId, { id: guildId, name: "@everyone", managed: false }],
        [roleId, { id: roleId, name: "Mission Alerts", managed: false }],
      ]),
    },
  };
  let botGuildFetch = async () => guild;
  const client = { guilds: { fetch: (...args) => botGuildFetch(...args) } };
  const express = require("express");
  const app = express();
  app.use(createDiscordOAuthRouter({ client, db: fakeDatabase }));
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    global.fetch = originalFetch;
    await new Promise((resolve, reject) => {
      server.closeAllConnections();
      server.close((error) => error ? reject(error) : resolve());
    });
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const callback = await originalFetch(`${baseUrl}/auth/discord/callback?state=invalid&code=invalid`);
  assert.equal(callback.status, 400);
  assert.deepEqual(await callback.json(), { error: "Invalid OAuth state." });

  const currentUser = await originalFetch(`${baseUrl}/api/me`);
  assert.equal(currentUser.status, 200);
  assert.deepEqual(await currentUser.json(), {
    user: { id: "12345678901234567", username: "test-user", globalName: null },
  });

  const protectedSettings = await originalFetch(
    `${baseUrl}/api/guilds/${guildId}/clan-mission-notification`
  );
  assert.equal(protectedSettings.status, 403);
  assert.deepEqual(await protectedSettings.json(), {
    error: "You must have Manage Server permission for this Discord server.",
  });

  const csrfAttempt = await originalFetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    headers: { Origin: "https://attacker.example" },
  });
  assert.equal(csrfAttempt.status, 403);
  assert.deepEqual(await csrfAttempt.json(), { error: "Cross-origin request rejected." });

  discordGuilds = [{ id: guildId, permissions: "32" }];
  const resources = await originalFetch(`${baseUrl}/api/guilds/${guildId}/resources`);
  assert.equal(resources.status, 200);
  assert.deepEqual(await resources.json(), {
    channels: [{ id: channelId, name: "clan-missions" }],
    roles: [{ id: roleId, name: "Mission Alerts" }],
  });

  botGuildFetch = async () => {
    throw Object.assign(new Error("temporary Discord failure"), { status: 503 });
  };
  const discordFailure = await originalFetch(`${baseUrl}/api/guilds/${guildId}/resources`);
  assert.equal(discordFailure.status, 502);
  assert.deepEqual(await discordFailure.json(), {
    error: "The request could not be completed.",
  });

  botGuildFetch = async () => {
    throw Object.assign(new Error("unknown guild"), { status: 404 });
  };
  const botNotInGuild = await originalFetch(`${baseUrl}/api/guilds/${guildId}/resources`);
  assert.equal(botNotInGuild.status, 403);
  assert.deepEqual(await botNotInGuild.json(), {
    error: "The bot must be a member of this Discord server.",
  });
  botGuildFetch = async () => guild;

  const savedSettings = await originalFetch(
    `${baseUrl}/api/guilds/${guildId}/clan-mission-notification`,
    {
      method: "PUT",
      headers: { Origin: "http://localhost", "Content-Type": "application/json" },
      body: JSON.stringify({ channelId, roleId, enabled: false, language: "Arabic" }),
    }
  );
  assert.equal(savedSettings.status, 200);
  assert.deepEqual((await savedSettings.json()).settings, {
    guildId,
    channelId,
    roleId,
    enabled: false,
    language: "Arabic",
    nextReset: (await notifier.getGuildConfig(guildId)).nextReset,
  });

  const invalidChannel = await originalFetch(
    `${baseUrl}/api/guilds/${guildId}/clan-mission-notification`,
    {
      method: "PUT",
      headers: { Origin: "http://localhost", "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: "56789012345678901" }),
    }
  );
  assert.equal(invalidChannel.status, 400);

  const logout = await originalFetch(`${baseUrl}/auth/logout`, {
    method: "POST",
    headers: { Origin: "http://localhost" },
  });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get("set-cookie") || "", /HttpOnly/i);
  assert.match(logout.headers.get("set-cookie") || "", /SameSite=Lax/i);
});

test.after(() => {
  if (originalDbModule) require.cache[dbPath] = originalDbModule;
  else delete require.cache[dbPath];
  if (originalSessionModule) require.cache[sessionModulePath] = originalSessionModule;
  else delete require.cache[sessionModulePath];
  if (originalMongoStoreModule) require.cache[mongoStoreModulePath] = originalMongoStoreModule;
  else delete require.cache[mongoStoreModulePath];
});
