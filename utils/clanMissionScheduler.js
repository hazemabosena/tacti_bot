const { getGuildConfig, readData, getNextReset } = require("./clanMissionNotifier");
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

function updateNextReset(config) {
  const currentNext = new Date(config.nextReset);
  const now = new Date();
  if (now >= currentNext) {
    const next = getNextReset(now);
    config.nextReset = next.toISOString();
    return true;
  }
  return false;
}

async function checkAndSendNotifications(client) {
  const data = readData();
  const now = new Date();

  for (const [guildId, config] of Object.entries(data.guilds)) {
    if (!config || !config.enabled) continue;

    const nextReset = new Date(config.nextReset);
    if (now >= nextReset) {
      await sendNotification(client, guildId, config);
      updateNextReset(config);
    }
  }

  // Save updated nextReset times
  const updatedData = readData();
  let changed = false;
  for (const [guildId, config] of Object.entries(updatedData.guilds)) {
    if (config && config.enabled) {
      const nextReset = new Date(config.nextReset);
      if (now >= nextReset) {
        const newNext = getNextReset(now);
        updatedData.guilds[guildId].nextReset = newNext.toISOString();
        changed = true;
      }
    }
  }
  if (changed) {
    const { writeData } = require("./clanMissionNotifier");
    writeData(updatedData);
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