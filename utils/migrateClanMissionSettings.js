const fs = require("fs");
const { isDeepStrictEqual } = require("util");

async function migrateLegacySettings(collection, legacyDataFile) {
  if (!fs.existsSync(legacyDataFile)) return 0;

  const legacyData = JSON.parse(fs.readFileSync(legacyDataFile, "utf8"));
  if (
    !legacyData ||
    typeof legacyData !== "object" ||
    !legacyData.guilds ||
    typeof legacyData.guilds !== "object" ||
    Array.isArray(legacyData.guilds)
  ) {
    throw new Error("Legacy clan mission notification data has an invalid format.");
  }

  let verifiedCount = 0;
  for (const [guildId, config] of Object.entries(legacyData.guilds)) {
    if (
      !/^\d{17,20}$/.test(guildId) ||
      !config ||
      typeof config !== "object" ||
      Array.isArray(config) ||
      config.channelId == null ||
      !["string", "number"].includes(typeof config.channelId)
    ) {
      throw new Error(`Legacy clan mission notification data is invalid for guild ${guildId}.`);
    }

    const normalizedConfig = {
      ...config,
      guildId,
      channelId: String(config.channelId),
      roleId: config.roleId == null ? null : String(config.roleId),
    };
    const result = await collection.updateOne(
      { _id: guildId },
      { $setOnInsert: normalizedConfig },
      { upsert: true }
    );

    if (!result.acknowledged || (result.matchedCount !== 1 && result.upsertedCount !== 1)) {
      throw new Error(`MongoDB did not confirm importing settings for guild ${guildId}.`);
    }

    const importedConfig = await collection.findOne({ _id: guildId });
    const { _id, ...storedConfig } = importedConfig || {};
    if (
      !importedConfig ||
      Object.entries(normalizedConfig).some(([key, value]) => !isDeepStrictEqual(storedConfig[key], value))
    ) {
      throw new Error(`MongoDB settings verification failed for guild ${guildId}; the legacy file was preserved.`);
    }
    verifiedCount += 1;
  }

  return verifiedCount;
}

module.exports = { migrateLegacySettings };
