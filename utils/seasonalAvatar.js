const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const TIME_ZONE = "Africa/Cairo";
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_RAMADAN_START = "2027-02-14";
const ASSET_FILES = Object.freeze({
  original: "avatar-original.png.jpeg",
  christmas: "avatar_christmas.png.jpeg",
  halloween: "avatar_halloween.png.jpeg",
  ramadan: "avatar-ramadan.png.jpeg",
  valentines: "avatar-valentine.png.jpeg",
});
const ASSET_PATHS = Object.freeze(Object.fromEntries(
  Object.entries(ASSET_FILES).map(([role, fileName]) => [
    role,
    path.resolve(__dirname, "..", "assets_2", fileName),
  ])
));
const STATE_PATH = path.resolve(__dirname, "..", "data", "seasonal-avatar-state.json");

let schedulerInterval = null;
let activeCheck = null;

function parseDateOnly(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new TypeError("Date must use YYYY-MM-DD format.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return Math.floor(date.getTime() / DAY_MS);
}

function dateOnlyFromDayNumber(dayNumber) {
  return new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
}

function getCalendarDate(value, timeZone = TIME_ZONE) {
  if (typeof value === "string") {
    parseDateOnly(value);
    return value;
  }
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError("Expected a valid Date or a YYYY-MM-DD date string.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function getRamadanStartDay(date) {
  const targetDay = parseDateOnly(date);
  let startDay = parseDateOnly(FIRST_RAMADAN_START);

  if (targetDay < startDay) return null;

  while (startDay <= targetDay) {
    if (targetDay <= startDay + 31) return startDay;

    const nextStart = new Date(startDay * DAY_MS);
    nextStart.setUTCFullYear(nextStart.getUTCFullYear() + 1);
    nextStart.setUTCDate(nextStart.getUTCDate() - 12);
    startDay = Math.floor(nextStart.getTime() / DAY_MS);
  }
  return null;
}

function getAvatarDecision(value = new Date(), timeZone = TIME_ZONE) {
  const date = getCalendarDate(value, timeZone);
  const dayNumber = parseDateOnly(date);
  const [, monthText, dayText] = date.split("-");
  const month = Number(monthText);
  const day = Number(dayText);

  if (month === 10 && day === 31) {
    return { role: "halloween", date, reason: "Halloween special-event date" };
  }
  if (month === 12 && day === 25) {
    return { role: "christmas", date, reason: "Christmas special-event date" };
  }
  if (month === 2 && day === 14) {
    return { role: "valentines", date, reason: "Valentine's Day special-event date" };
  }

  if (getRamadanStartDay(date) !== null) {
    return { role: "ramadan", date, reason: "scheduled Ramadan period" };
  }

  if ((month === 10 && day >= 1) || (month === 11 && day <= 2)) {
    return { role: "halloween", date, reason: "Halloween seasonal period" };
  }
  if ((month === 12 && day >= 1) || (month === 1 && day <= 8)) {
    return { role: "christmas", date, reason: "Christmas seasonal period" };
  }
  if (month === 2 && day >= 1 && day <= 16) {
    return { role: "valentines", date, reason: "Valentine's Day seasonal period" };
  }
  return { role: "original", date, reason: "no active seasonal period" };
}

function logError(context, error) {
  console.error(`[seasonal-avatar] ${context}`, {
    name: error?.name || "Error",
    code: error?.code,
    status: error?.status,
    retryAfter: error?.retryAfter,
    message: error?.message,
  });
}

function readKnownAvatarHashes() {
  try {
    if (!fs.existsSync(STATE_PATH)) return {};
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      throw new TypeError("Seasonal avatar state must be a JSON object.");
    }
    return state;
  } catch (error) {
    logError("Could not read saved avatar state; the desired avatar will be checked against Discord.", error);
    return {};
  }
}

function saveKnownAvatarHashes(state) {
  const temporaryPath = `${STATE_PATH}.${process.pid}.tmp`;
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    fs.renameSync(temporaryPath, STATE_PATH);
  } catch (error) {
    logError("Could not persist the current avatar hash.", error);
    try {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    } catch (cleanupError) {
      logError("Could not remove temporary avatar state.", cleanupError);
    }
  }
}

async function updateAvatarIfNeeded(client, now = new Date()) {
  if (!client?.user) throw new Error("The Discord client is not ready.");

  const decision = getAvatarDecision(now);
  console.log(
    `[seasonal-avatar] Selected ${decision.role} avatar for ${decision.date} (${decision.reason}).`
  );

  const imagePath = ASSET_PATHS[decision.role];
  if (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
    throw new Error(`Avatar image is missing or not a file: ${imagePath}`);
  }

  const image = fs.readFileSync(imagePath);
  const imageHash = crypto.createHash("sha256").update(image).digest("hex");
  const state = readKnownAvatarHashes();
  const savedAvatar = state[decision.role];
  if (
    savedAvatar?.imageHash === imageHash &&
    savedAvatar?.discordAvatarHash &&
    client.user.avatar === savedAvatar.discordAvatarHash
  ) {
    console.log(`[seasonal-avatar] ${decision.role} avatar is already active; no upload needed.`);
    return;
  }

  const updatedUser = await client.user.setAvatar(image);
  const discordAvatarHash = updatedUser?.avatar || client.user.avatar;
  if (!discordAvatarHash) {
    throw new Error("Discord accepted the avatar update but did not return an avatar hash.");
  }

  state[decision.role] = { imageHash, discordAvatarHash };
  saveKnownAvatarHashes(state);
  console.log(`[seasonal-avatar] Updated bot profile avatar to ${decision.role}.`);
}

function checkAndUpdateAvatar(client) {
  if (activeCheck) return activeCheck;

  const check = updateAvatarIfNeeded(client);
  const guardedCheck = check.finally(() => {
    if (activeCheck === guardedCheck) activeCheck = null;
  });
  activeCheck = guardedCheck;
  return guardedCheck;
}

function startSeasonalAvatarScheduler(client) {
  if (schedulerInterval) return;

  const runCheck = (context) => {
    checkAndUpdateAvatar(client).catch((error) => logError(context, error));
  };

  schedulerInterval = setInterval(
    () => runCheck("Scheduled avatar check failed."),
    CHECK_INTERVAL_MS
  );
  if (typeof schedulerInterval.unref === "function") schedulerInterval.unref();

  runCheck("Initial avatar check failed.");
  console.log(`[seasonal-avatar] Scheduler started; calendar timezone is ${TIME_ZONE}.`);
}

function stopSeasonalAvatarScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[seasonal-avatar] Scheduler stopped.");
  }
}

module.exports = {
  ASSET_FILES,
  TIME_ZONE,
  getAvatarDecision,
  getCalendarDate,
  startSeasonalAvatarScheduler,
  stopSeasonalAvatarScheduler,
};
