const fs = require("fs");
const path = require("path");

const DATA_FILE = path.resolve(__dirname, "..", "data", "clanMissionNotifications.json");

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ guilds: {} }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read clan mission notification data:", err);
    return { guilds: {} };
  }
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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

function getGuildConfig(guildId) {
  const data = readData();
  return data.guilds[guildId] || null;
}

function setGuildConfig(guildId, config) {
  const data = readData();
  data.guilds[guildId] = config;
  writeData(data);
}

function deleteGuildConfig(guildId) {
  const data = readData();
  const existed = !!data.guilds[guildId];
  delete data.guilds[guildId];
  writeData(data);
  return existed;
}

module.exports = {
  readData,
  writeData,
  getNextReset,
  getTimeRemaining,
  formatResetDate,
  getGuildConfig,
  setGuildConfig,
  deleteGuildConfig,
  START_DATE,
  RESET_INTERVAL_MS
};