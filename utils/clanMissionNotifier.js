const path = require("path");
const { connectToDatabase } = require("../db");
const { migrateLegacySettings } = require("./migrateClanMissionSettings");

const SETTINGS_COLLECTION = "cm_notification_settings";
const LEGACY_DATA_FILE = path.resolve(__dirname, "..", "data", "clanMissionNotifications.json");
let legacyMigrationPromise = null;

async function getSettingsCollection() {
  const connection = await connectToDatabase();
  if (!connection.connected || !connection.db) {
    throw new Error("MongoDB is unavailable for clan mission notification settings.");
  }

  const collection = connection.db.collection(SETTINGS_COLLECTION);
  await ensureLegacyMigration(collection);
  return collection;
}

async function ensureLegacyMigration(collection) {
  if (legacyMigrationPromise) return legacyMigrationPromise;

  legacyMigrationPromise = (async () => {
    const migratedCount = await migrateLegacySettings(collection, LEGACY_DATA_FILE);

    console.log(`[cm-notifications] Verified ${migratedCount} legacy guild setting(s); the JSON file was preserved.`);
  })().catch((error) => {
    legacyMigrationPromise = null;
    throw error;
  });

  return legacyMigrationPromise;
}

function withoutMongoId(document) {
  if (!document) return null;
  const { _id, ...config } = document;
  return config;
}

// Starting reset: Friday, June 26, 2026 06:00 AM Cairo Time (UTC+3)
// Then +4 days +3 hours after every reset.
const START_DATE = new Date("2026-06-26T06:00:00+03:00");
const RESET_INTERVAL_MS = (4 * 24 + 3) * 60 * 60 * 1000; // 4 days 3 hours in ms

function getNextReset(fromDate = new Date()) {
  if (fromDate <= START_DATE) return new Date(START_DATE);
  const elapsed = fromDate.getTime() - START_DATE.getTime();
  const intervals = Math.floor(elapsed / RESET_INTERVAL_MS);
  const next = new Date(START_DATE.getTime() + (intervals + 1) * RESET_INTERVAL_MS);
  return next;
}

function getTimeRemaining(nextReset) {
  const now = new Date();
  const diff = nextReset.getTime() - now.getTime();
  if (diff <= 0) return "0d 0h";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h remaining`;
}

function formatResetDate(nextReset) {
  return nextReset.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Cairo",
    timeZoneName: "short"
  });
}

async function getGuildConfig(guildId) {
  const collection = await getSettingsCollection();
  const document = await collection.findOne({ _id: String(guildId) });
  return withoutMongoId(document);
}

async function getAllGuildConfigs() {
  const collection = await getSettingsCollection();
  const documents = await collection.find({}).toArray();
  return documents.map(withoutMongoId);
}

async function setGuildConfig(guildId, config) {
  const collection = await getSettingsCollection();
  const normalizedGuildId = String(guildId);
  const document = {
    ...config,
    guildId: normalizedGuildId,
    channelId: String(config.channelId),
    roleId: config.roleId == null ? null : String(config.roleId),
  };
  const result = await collection.updateOne(
    { _id: normalizedGuildId },
    { $set: document },
    { upsert: true }
  );

  if (!result.acknowledged || (result.matchedCount !== 1 && result.upsertedCount !== 1)) {
    throw new Error("MongoDB did not confirm saving clan mission notification settings.");
  }
}

async function updateGuildNextReset(guildId, nextReset) {
  const collection = await getSettingsCollection();
  const result = await collection.updateOne(
    { _id: String(guildId) },
    { $set: { nextReset } }
  );

  if (!result.acknowledged || result.matchedCount !== 1) {
    throw new Error("MongoDB did not confirm updating the next clan mission reset.");
  }
}

async function deleteGuildConfig(guildId) {
  const collection = await getSettingsCollection();
  const result = await collection.deleteOne({ _id: String(guildId) });
  if (!result.acknowledged) {
    throw new Error("MongoDB did not confirm deleting clan mission notification settings.");
  }
  return result.deletedCount === 1;
}

module.exports = {
  getNextReset,
  getTimeRemaining,
  formatResetDate,
  getGuildConfig,
  getAllGuildConfigs,
  setGuildConfig,
  updateGuildNextReset,
  deleteGuildConfig,
  START_DATE,
  RESET_INTERVAL_MS
};