const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
require("dotenv").config();

const generateMissionImage = require("./image/generateMissionImage.js");
const { missionData } = require("./missionData.js");

const BOT_NAME = "TACTIOPBOT";
const COMMAND = "/!clanmission!";
const SKIP = "Skip";

const missionChoices = [
  "Skip",
  "Breach",
  "B.S.S",
  "Basic Mission",
  "Bayonet",
  "Clean Up",
  "Common Only",
  "Cover",
  "Hammer",
  "HILDR",
  "Knife",
  "Local",
  "Logistics",
  "Rare Only",
  "Recon",
  "Showdown",
  "Uncommon Only",
];

function normalizeMissionName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const missionLookup = new Map(
  missionChoices.map((name) => [normalizeMissionName(name), name])
);

function parseMissionsFromCommand(text) {
  const payload = String(text || "").trim();
  if (!payload) return { missions: [], unknown: [] };

  const rawTokens = payload
    .split(/[,\n|]/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const missions = [];
  const unknown = [];

  for (const token of rawTokens) {
    const key = normalizeMissionName(token);
    const mapped = missionLookup.get(key);
    if (!mapped) {
      unknown.push(token);
      continue;
    }
    missions.push(mapped);
  }

  return { missions, unknown };
}

// Same placement rules used in Discord /clanmission.
function assignBestOperators(missions) {
  const selected = missions.filter((m) => m && m.toLowerCase() !== "skip");
  const lastMission = selected[selected.length - 1];
  const perOp = {};

  for (const mission of selected) {
    const ops = missionData[mission] || {};
    for (const [op, value] of Object.entries(ops)) {
      if (!perOp[op]) perOp[op] = {};
      perOp[op][mission] = value;
    }
  }

  const results = {};
  for (const mission of selected) results[mission] = [];

  for (const [op, valuesByMission] of Object.entries(perOp)) {
    const entries = Object.entries(valuesByMission);
    if (!entries.length) continue;

    const firstVal = entries[0][1];
    const allSame = entries.every(([, v]) => v === firstVal) && entries.length > 1;

    if (allSame && lastMission) {
      results[lastMission].push({ op, value: firstVal });
      continue;
    }

    let bestMission = entries[0][0];
    let bestValue = entries[0][1];
    for (let i = 1; i < entries.length; i += 1) {
      const [m, v] = entries[i];
      if (v > bestValue) {
        bestMission = m;
        bestValue = v;
      }
    }
    results[bestMission].push({ op, value: bestValue });
  }

  for (const mission of Object.keys(results)) {
    results[mission].sort((a, b) => b.value - a.value || a.op.localeCompare(b.op));
  }

  return results;
}

function buildReplyText(missions, results) {
  let reply = `*${BOT_NAME}*\nBest operator placement for your clan:\n\n`;
  missions.forEach((m, i) => {
    const header = `M${i + 1} - ${m && m.toLowerCase() !== "skip" ? m : "(skipped)"}`;
    if (!m || m.toLowerCase() === "skip") {
      reply += `${header}\n\n`;
      return;
    }

    const opsList = results[m] && results[m].length ? results[m] : [];
    if (!opsList.length) {
      reply += `${header}\n- No operators\n\n`;
      return;
    }

    reply += `${header}\n- ${opsList.map((o) => o.op).join(" , ")}\n\n`;
  });
  return reply.trim();
}

function usageText() {
  return [
    `*${BOT_NAME}*`,
    `Use ${COMMAND} then mission names separated by "," or "|".`,
    "Example:",
    `${COMMAND} Breach | Cover | Logistics`,
    "",
    `You can send up to 8 missions. Use "${SKIP}" for empty slots.`,
    "",
    "Available missions:",
    missionChoices.join(", "),
  ].join("\n");
}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "clanmission-bot" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("Scan this QR code in WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log(`${BOT_NAME} WhatsApp bot is ready.`);
  console.log(`Command: ${COMMAND}`);
  console.log(`Logged in as: ${client.info?.wid?._serialized || "unknown"}`);
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure:", msg);
});

client.on("disconnected", (reason) => {
  console.error("Client disconnected:", reason);
});

client.on("message_create", async (message) => {
  try {
    const body = String(message.body || "").trim();
    if (!body.toLowerCase().startsWith(COMMAND.toLowerCase())) return;

    const payload = body.slice(COMMAND.length).trim();
    if (!payload) {
      await message.reply(usageText());
      return;
    }

    const { missions: parsedMissions, unknown } = parseMissionsFromCommand(payload);
    if (unknown.length > 0) {
      await message.reply(
        `Unknown mission(s): ${unknown.join(", ")}\n\n${usageText()}`
      );
      return;
    }

    if (!parsedMissions.length) {
      await message.reply(usageText());
      return;
    }

    const missions = parsedMissions.slice(0, 8);
    while (missions.length < 8) missions.push(SKIP);

    const nonSkip = missions.filter((m) => m.toLowerCase() !== "skip");
    if (!nonSkip.length) {
      await message.reply("You must pick at least one mission.");
      return;
    }

    const results = assignBestOperators(missions);
    const reply = buildReplyText(missions, results);

    const missionObjects = missions.map((m) => {
      if (m.toLowerCase() === "skip") {
        return { name: SKIP, operators: [] };
      }
      return {
        name: m,
        operators: (results[m] || []).map((o) => ({ name: o.op, value: o.value })),
      };
    });

    try {
      const imageBuffer = await generateMissionImage(missionObjects);
      const media = new MessageMedia(
        "image/png",
        imageBuffer.toString("base64"),
        "clan_mission.png"
      );
      await client.sendMessage(message.from, media, { caption: reply });
    } catch (imageErr) {
      console.error("Image generation failed:", imageErr && imageErr.message);
      await message.reply(reply);
    }
  } catch (err) {
    console.error("Message handler error:", err);
    try {
      await message.reply("Error while handling /!clanmission! command.");
    } catch (_) {}
  }
});

client.initialize();
