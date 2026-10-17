const {
  getAllGuildConfigs,
  updateGuildNextReset,
  getNextReset
} = require("./clanMissionNotifier");
const { languages } = require("./cmNotificationLanguages");

let schedulerInterval = null;

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
      return;
    }

    const channel = await guild.channels.fetch(config.channelId);
    if (!channel || !channel.isTextBased()) {
      console.warn(`Channel ${config.channelId} not found or not text-based for guild ${guildId}.`);
      return;
    }

    const message = buildNotificationMessage(config);
    await channel.send(message);
    console.log(`✅ Sent clan mission reset notification to guild ${guildId}, channel ${config.channelId}`);
  } catch (err) {
    console.error(`❌ Failed to send clan mission notification for guild ${guildId}:`, err);
  }
}

async function checkAndSendNotifications(client) {
  const configs = await getAllGuildConfigs();
  const now = new Date();

  for (const config of configs) {
    if (!config || !config.enabled) continue;

    const nextReset = new Date(config.nextReset);
    if (now >= nextReset) {
      await sendNotification(client, config.guildId, config);
      const next = getNextReset(now).toISOString();
      await updateGuildNextReset(config.guildId, next);
    }
  }
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