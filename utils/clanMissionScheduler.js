const crypto = require("crypto");
const {
  getAllGuildConfigs,
  claimGuildNotification,
  completeGuildNotification,
  releaseGuildNotificationClaim,
  getNextReset
} = require("./clanMissionNotifier");
const { languages } = require("./cmNotificationLanguages");

let schedulerInterval = null;
let activeCheck = null;
const CLAIM_LEASE_MS = 2 * 60 * 1000;

function buildNotificationMessage(config) {
  const roleMention = config.roleId ? `<@&${config.roleId}>` : "";
  const lang = languages[config.language] || languages.English;
  const message = `${roleMention ? roleMention + "\n" : ""}${lang.title}\n\n${lang.message}\n${lang.footer}`;
  return message;
}

async function sendNotification(client, guildId, config) {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      console.warn(`Guild ${guildId} not found for clan mission notification.`);
      return false;
    }

    const channel = await guild.channels.fetch(config.channelId);
    if (!channel || !channel.isTextBased()) {
      console.warn(`Channel ${config.channelId} not found or not text-based for guild ${guildId}.`);
      return false;
    }

    const message = buildNotificationMessage(config);
    await channel.send(message);
    console.log(`✅ Sent clan mission reset notification to guild ${guildId}, channel ${config.channelId}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send clan mission notification for guild ${guildId}:`, err);
    return false;
  }
}

async function runNotificationCheck(client) {
  const configs = await getAllGuildConfigs();
  const now = new Date();

  for (const config of configs) {
    if (!config || !config.enabled) continue;

    const nextReset = new Date(config.nextReset);
    if (now >= nextReset) {
      const expectedNextReset = config.nextReset;
      const claimToken = crypto.randomUUID();
      const claimTime = new Date();
      const claimed = await claimGuildNotification(
        config.guildId,
        expectedNextReset,
        claimToken,
        claimTime,
        CLAIM_LEASE_MS
      );
      if (!claimed) continue;

      try {
        const delivered = await sendNotification(client, config.guildId, config);
        if (!delivered) {
          await releaseGuildNotificationClaim(config.guildId, claimToken);
          continue;
        }

        const next = getNextReset(now).toISOString();
        const completed = await completeGuildNotification(
          config.guildId,
          expectedNextReset,
          claimToken,
          next
        );
        if (!completed) {
          console.error(`Could not finalize clan mission notification for guild ${config.guildId}; its reset was not advanced.`);
          await releaseGuildNotificationClaim(config.guildId, claimToken);
        }
      } catch (error) {
        try {
          await releaseGuildNotificationClaim(config.guildId, claimToken);
        } catch (releaseError) {
          console.error(`Could not release clan mission notification claim for guild ${config.guildId} (${releaseError?.name || "Error"}).`);
        }
        throw error;
      }
    }
  }
}

function checkAndSendNotifications(client) {
  if (activeCheck) return activeCheck;

  const check = runNotificationCheck(client);
  const guardedCheck = check.finally(() => {
    if (activeCheck === guardedCheck) activeCheck = null;
  });
  activeCheck = guardedCheck;
  return guardedCheck;
}

function startScheduler(client) {
  if (schedulerInterval) return;

  // Check every minute
  schedulerInterval = setInterval(() => {
    checkAndSendNotifications(client).catch((err) => {
      console.error("Error in clan mission notification scheduler:", err);
    });
  }, 60 * 1000);

  // Also run once immediately on start
  checkAndSendNotifications(client).catch((err) => {
    console.error("Error in initial clan mission notification check:", err);
  });

  console.log("📅 Clan Mission notification scheduler started.");
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("🛑 Clan Mission notification scheduler stopped.");
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  checkAndSendNotifications,
  buildNotificationMessage,
};