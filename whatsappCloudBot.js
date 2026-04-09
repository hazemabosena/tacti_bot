const http = require("http");
const { URL } = require("url");
require("dotenv").config();

const generateMissionImage = require("./image/generateMissionImage.js");
const { missionData } = require("./missionData.js");

const BOT_NAME = "TACTIOPBOT";
const COMMAND = "/!clanmission!";
const SKIP = "Skip";
const PORT = Number(process.env.PORT || 3000);

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v22.0";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

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

function graphBase() {
  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;
}

async function graphRequest(path, options = {}) {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error("Missing WHATSAPP_ACCESS_TOKEN");
  }

  const headers = Object.assign({}, options.headers || {}, {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  });

  const response = await fetch(`${graphBase()}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_) {
    data = { raw };
  }

  if (!response.ok) {
    throw new Error(`Graph API ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sendWhatsAppText(to, text, contextMessageId) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  if (contextMessageId) {
    payload.context = { message_id: contextMessageId };
  }

  return graphRequest(`/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function uploadImageBuffer(buffer, filename) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID");
  }

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", new Blob([buffer], { type: "image/png" }), filename);

  const data = await graphRequest(`/${WHATSAPP_PHONE_NUMBER_ID}/media`, {
    method: "POST",
    body: form,
  });

  return data.id;
}

async function sendWhatsAppImage(to, mediaId, caption, contextMessageId) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { id: mediaId, caption: caption || "" },
  };

  if (contextMessageId) {
    payload.context = { message_id: contextMessageId };
  }

  return graphRequest(`/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];
  for (const item of output) {
    if (!Array.isArray(item?.content)) continue;
    for (const part of item.content) {
      if (part?.type === "output_text" && part.text) {
        chunks.push(part.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

async function generateAIReply(userText, senderName) {
  if (!GROQ_API_KEY) {
    return `${BOT_NAME} is online.\nSend ${COMMAND} for mission planning.\n\nTo enable AI chat replies, set GROQ_API_KEY in env.`;
  }

  const prompt = [
    `You are ${BOT_NAME}, a helpful WhatsApp assistant.`,
    "Be concise, practical, and friendly.",
    `If user asks mission planning, tell them to use ${COMMAND}.`,
  ].join(" ");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.6,
      max_tokens: 250,
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: `Sender: ${senderName || "Unknown"}\nMessage: ${userText}`,
        },
      ],
    }),
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(`Groq ${response.status}: ${raw}`);
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || "I could not generate a reply right now.";
}

async function handleClanMissionCommand(from, messageId, payload) {
  if (!payload) {
    await sendWhatsAppText(from, usageText(), messageId);
    return;
  }

  const { missions: parsedMissions, unknown } = parseMissionsFromCommand(payload);
  if (unknown.length > 0) {
    await sendWhatsAppText(
      from,
      `Unknown mission(s): ${unknown.join(", ")}\n\n${usageText()}`,
      messageId
    );
    return;
  }

  if (!parsedMissions.length) {
    await sendWhatsAppText(from, usageText(), messageId);
    return;
  }

  const missions = parsedMissions.slice(0, 8);
  while (missions.length < 8) missions.push(SKIP);

  const nonSkip = missions.filter((m) => m.toLowerCase() !== "skip");
  if (!nonSkip.length) {
    await sendWhatsAppText(from, "You must pick at least one mission.", messageId);
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
    const mediaId = await uploadImageBuffer(imageBuffer, "clan_mission.png");
    await sendWhatsAppImage(from, mediaId, reply, messageId);
  } catch (err) {
    console.error("Clan mission image flow failed:", err && err.message);
    await sendWhatsAppText(from, reply, messageId);
  }
}

async function handleIncomingMessage(message, contactName) {
  if (!message || message.type !== "text" || !message.text?.body) return;

  const from = message.from;
  const messageId = message.id;
  const body = String(message.text.body || "").trim();

  if (!from || !body) return;

  if (body.toLowerCase().startsWith(COMMAND.toLowerCase())) {
    const payload = body.slice(COMMAND.length).trim();
    await handleClanMissionCommand(from, messageId, payload);
    return;
  }

  const aiReply = await generateAIReply(body, contactName);
  await sendWhatsAppText(from, `*${BOT_NAME}*\n${aiReply}`, messageId);
}

async function processWebhookPayload(payload) {
  if (!payload?.entry) return;

  for (const entry of payload.entry) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};
      const messages = Array.isArray(value.messages) ? value.messages : [];
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactName = contacts[0]?.profile?.name;

      for (const message of messages) {
        try {
          await handleIncomingMessage(message, contactName);
        } catch (err) {
          console.error("Message processing failed:", err && err.message);
        }
      }
    }
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (reqUrl.pathname === "/health") {
    send(res, 200, "OK");
    return;
  }

  if (reqUrl.pathname === "/webhook" && req.method === "GET") {
    const mode = reqUrl.searchParams.get("hub.mode");
    const token = reqUrl.searchParams.get("hub.verify_token");
    const challenge = reqUrl.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
      send(res, 200, challenge || "");
      return;
    }
    send(res, 403, "Forbidden");
    return;
  }

  if (reqUrl.pathname === "/webhook" && req.method === "POST") {
    try {
      const payload = await readBody(req);
      send(res, 200, "EVENT_RECEIVED");
      processWebhookPayload(payload).catch((err) =>
        console.error("Webhook async processing error:", err && err.message)
      );
      return;
    } catch (err) {
      console.error("Invalid webhook payload:", err && err.message);
      send(res, 400, "Bad Request");
      return;
    }
  }

  send(res, 404, "Not Found");
});

if (!WHATSAPP_VERIFY_TOKEN || !WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
  console.error(
    "Missing required env vars: WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID"
  );
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`${BOT_NAME} Cloud API bot listening on port ${PORT}`);
  console.log("Webhook endpoints:");
  console.log(`- GET  /webhook (verification)`);
  console.log(`- POST /webhook (events)`);
  console.log(`- GET  /health`);
});
