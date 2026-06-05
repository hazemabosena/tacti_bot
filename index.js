const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");
const express = require("express");
const axios = require("axios");
const chokidar = require("chokidar");
require("dotenv").config();

// Accept either TOKEN or DISCORD_TOKEN so different hosts can use their
// preferred environment variable name.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// Helper: load commands from ./commands or fallback to repo root. Safe to call multiple times.
function loadCommandsFromFs() {
  const path = require("path");
  const commandsDir = path.resolve(__dirname, "commands");
  let files = [];
  try {
    if (fs.existsSync(commandsDir)) {
      files = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"));
      console.log("Loading command files from ./commands:", files);
      for (const file of files) {
        try {
          const full = path.join(commandsDir, file);
          // clear cache so updates are picked up on re-load
          delete require.cache[require.resolve(full)];
          const command = require(full);
          if (command && command.data && command.data.name) {
            client.commands.set(command.data.name, command);
          } else {
            console.warn(`Skipping invalid command file: ${file}`);
          }
        } catch (err) {
          console.error(`Failed to load command file ${file}:`, err && err.message);
        }
      }
    } else {
      console.log("⚠ Commands folder not found. Skipping command loading.");
      // fallback: scan repo root
      const rootFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".js"));
      const exclude = new Set(["index.js", "deploy-commands.js", "missionData.js", "package.json"]);
      const rootCommandFiles = rootFiles.filter((f) => !exclude.has(f));
      if (rootCommandFiles.length) {
        console.log("Found possible command files at repo root:", rootCommandFiles);
        for (const file of rootCommandFiles) {
          try {
            const full = path.join(__dirname, file);
            delete require.cache[require.resolve(full)];
            const command = require(full);
            if (command && command.data && command.data.name) {
              client.commands.set(command.data.name, command);
              console.log(`Loaded command from root: ${file}`);
            }
          } catch (err) {
            // not a command file, ignore
          }
        }
      }
    }
  } catch (err) {
    console.error("Error while scanning commands:", err && err.message);
  }
}

// initial load (best-effort)
loadCommandsFromFs();

// If no commands were loaded from files (e.g., missing folder in deployment),
// provide a small built-in fallback command so the bot still exposes at least
// one slash command in Discord (useful for testing deployments like Railway).
if (client.commands.size === 0) {
  try {
    const { SlashCommandBuilder } = require("discord.js");
    const pingCommand = {
      data: new SlashCommandBuilder().setName("ping").setDescription("Check bot is alive"),
      async execute(interaction) {
        await interaction.reply({ content: "Pong!", ephemeral: true });
      },
    };
    client.commands.set(pingCommand.data.name, pingCommand);
    console.log("⚡ No command files found — registered fallback command: /ping");
  } catch (e) {
    console.warn("Could not register fallback command:", e);
  }
}

// Debug: show commands folder status
try {
  const commandsPath = path.resolve(__dirname, "commands");
  console.log("cwd:", process.cwd());
  console.log("commandsPath exists:", fs.existsSync(commandsPath));
  if (fs.existsSync(commandsPath)) console.log("commands files:", fs.readdirSync(commandsPath));
} catch (e) {
  console.warn("Could not inspect commands folder:", e);
}

// Startup environment diagnostics (masked token, presence of CLIENT_ID)
try {
  const hasToken = !!DISCORD_TOKEN;
  const hasClientId = !!process.env.CLIENT_ID;
  const masked = hasToken ? `***${String(DISCORD_TOKEN).slice(-6)}` : "NONE";
  console.log("env: TOKEN present?", hasToken, "masked_suffix:", masked, "CLIENT_ID present?", hasClientId);
  console.log("Loaded command files count:", client.commands.size);
} catch (e) {
  console.warn("Could not print env diagnostics:", e);
}

// Auto-register commands with Discord on startup (helps when deploying to Railway)
async function registerCommands() {
  try {
    if (!DISCORD_TOKEN || !process.env.CLIENT_ID) {
      console.log("Skipping auto-registration: missing TOKEN or CLIENT_ID");
      return;
    }

    const commands = [];
    const commandNames = [];

    const commandsDir = path.resolve(__dirname, "commands");
    let filesToLoad = [];

    if (fs.existsSync(commandsDir)) {
      filesToLoad = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"));
      console.log("registerCommands: found command files in ./commands:", filesToLoad);
    } else {
      const rootFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith(".js"));
      const exclude = new Set(["index.js", "deploy-commands.js", "missionData.js", "package.json"]);
      filesToLoad = rootFiles.filter((f) => !exclude.has(f));
      if (filesToLoad.length) console.log("registerCommands: found command files at repo root:", filesToLoad);
    }

    for (const file of filesToLoad) {
      try {
        const filePath = fs.existsSync(commandsDir) ? path.join(commandsDir, file) : path.join(__dirname, file);
        const command = require(filePath);
        if (command && command.data) {
          commands.push(command.data.toJSON());
          commandNames.push(command.data.name || file);
        }
      } catch (err) {
        console.warn("registerCommands: failed to load command", file, err && err.message);
      }
    }

    if (!commands.length) {
      console.log("No commands to register.");
      return;
    }

    const { REST, Routes } = require("discord.js");
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    console.log("Registering commands with Discord...");
    console.log("Commands to register:", commandNames);

    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
      console.log("Successfully registered guild commands for GUILD_ID:", process.env.GUILD_ID);
      console.log("Registered commands:", commandNames);
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log("Successfully registered global commands. (Note: propagation can take up to an hour)");
      console.log("Registered commands:", commandNames);
    }
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
}

// Trigger registration (don't block startup)
registerCommands().catch((err) => console.error("registerCommands failed:", err));

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // Re-load commands from filesystem at ready time (in case they appeared after startup)
  try {
    loadCommandsFromFs();
    console.log("clientReady: loaded commands:", Array.from(client.commands.keys()));
  } catch (err) {
    console.warn("clientReady: failed to re-load commands:", err && err.message);
  }

  // Auto-register commands using the client application (works when bot is ready)
  try {
    const commands = client.commands.map((cmd) => cmd.data?.toJSON()).filter(Boolean);
    if (!commands.length) {
      console.log("No commands found to register via client.application.");
      return;
    }

    if (process.env.GUILD_ID) {
      // Try to register as guild commands for instant availability in that guild
      let guild = client.guilds.cache.get(process.env.GUILD_ID);
      if (!guild) {
        guild = await client.guilds.fetch(process.env.GUILD_ID).catch(() => null);
      }
      if (guild) {
        await guild.commands.set(commands);
        console.log(`✅ Slash commands registered to guild ${process.env.GUILD_ID}`);
        console.log("Registered commands:", commands.map((c) => c.name));
      } else {
        // Fallback to global registration
        await client.application.commands.set(commands);
        console.log("✅ Global slash commands registered (fallback)");
        console.log("Registered commands:", commands.map((c) => c.name));
      }
    } else {
      // Register global commands (may take up to an hour to propagate)
      await client.application.commands.set(commands);
      console.log("✅ Global slash commands registered");
      console.log("Registered commands:", commands.map((c) => c.name));
    }
  } catch (error) {
    console.error("❌ Failed to register commands:", error);
  }
});

// --- Railway / PaaS helpers ---
// Ensure DISCORD_TOKEN (or TOKEN) is set via environment (Railway provides project variables)
if (!DISCORD_TOKEN) {
  console.error("❌ Missing DISCORD_TOKEN in environment. Set DISCORD_TOKEN in Railway secrets or in your .env (do NOT commit it).");
  process.exit(1);
}

// === Express Web Server Setup ===
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public folder (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for Tacticool data
app.get('/api/tacticool', (req, res) => {
  try {
    // Try to load and parse the latest binary packet file
    let latestData = {
      playerId: "غير معروف",
      shopOffers: [],
      regions: []
    };

    try {
      const packetsDir = path.join(__dirname, 'packet.bin');
      if (fs.existsSync(packetsDir)) {
        const buffer = fs.readFileSync(packetsDir);
        const rawText = buffer.toString('utf-8', 0, Math.min(100000, buffer.length));
        
        // Extract patterns from the binary file
        const playerIdMatch = rawText.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
        if (playerIdMatch) latestData.playerId = playerIdMatch[0];

        const regions = ['eu-central-1', 'us-east-1', 'ap-south-1', 'sa-east-1', 'af-south-1'];
        regions.forEach(region => {
          if (rawText.includes(region)) {
            latestData.regions.push(region);
          }
        });

        const offerMatches = rawText.match(/com\.panzerdog\.[a-zA-Z0-9_\.]+/g) || [];
        latestData.shopOffers = [...new Set(offerMatches)];
      }
    } catch (err) {
      console.error('Error parsing packet.bin:', err.message);
    }

    res.json({
      status: 'success',
      data: latestData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Search players by Public ID (official Tacticool meta API)
app.get('/api/search/:playerId', async (req, res) => {
  const targetId = String(req.params.playerId || '').trim();

  if (!targetId) {
    return res.status(400).json({
      status: 'error',
      message: 'اكتب الـ Player ID بتاعك يا بطل'
    });
  }

  try {
    console.log(`🌐 [Tacticool API] جاري طلب البيانات الحقيقية للاعب: ${targetId}`);

    const officialApiResponse = await fetch('https://meta.tacticool.panzerdog.com/api/v1/player/club/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        playerId: targetId
      })
    });

    if (!officialApiResponse.ok) {
      console.log(`⚠️ السيرفر الرسمي رجع خطأ كود: ${officialApiResponse.status}`);
      return res.status(officialApiResponse.status).json({
        status: 'error',
        message: `سيرفر اللعبة رفض الطلب (كود: ${officialApiResponse.status})`
      });
    }

    const playerData = await officialApiResponse.json();
    console.log(`✅ قفشنا الداتا الحقيقية من السيرفر!`);

    return res.json({
      status: 'success',
      source: 'official_api',
      data: playerData
    });
  } catch (error) {
    console.error('❌ فشل الاتصال بسيرفر تكتيكول:', error && error.message ? error.message : error);
    return res.status(500).json({
      status: 'error',
      message: `فشل الـ Fetch الحقيقي: ${error && error.message ? error.message : error}`
    });
  }
});


// Health check endpoint (for hosting providers)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected registration endpoint
app.post('/register-commands', express.json(), async (req, res) => {
  try {
    const secret = process.env.REGISTER_SECRET;
    if (!secret) {
      return res.status(403).json({ error: "Registration endpoint is disabled (no REGISTER_SECRET configured)" });
    }

    const provided = req.headers['x-register-secret'];
    if (!provided || provided !== secret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await registerCommands();
    res.json({ ok: true, message: "Registration triggered" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Default route serves the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all for 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🌐 Web Server + API running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/tacticool`);
});

// Graceful shutdown to let Railway restart cleanly
const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  try {
    await client.destroy();
  } catch (err) {
    console.error("Error while destroying client:", err);
  }
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

console.log(
  `💓 initial heartbeat: ${new Date().toISOString()} PID:${process.pid} BOT_DIR:${process.env.BOT_DIR || "N/A"} PORT:${process.env.PORT || "N/A"} TOKEN:${process.env.DISCORD_TOKEN || process.env.TOKEN ? "present" : "missing"}`
);
setInterval(() => console.log(`💓 heartbeat: ${new Date().toISOString()} PID:${process.pid}`), 30 * 1000);
process.on("beforeExit", (code) => console.log(`🧾 beforeExit with code ${code} PID:${process.pid}`));
process.on("exit", (code) => console.log(`🔚 Process exiting with code ${code} PID:${process.pid}`));

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command || typeof command.autocomplete !== "function") return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error("Autocomplete error:", error);
      try {
        await interaction.respond([]);
      } catch (respondErr) {
        console.error("Failed to send autocomplete response:", respondErr);
      }
    }
    return;
  }

  // Handle connect verification (button + modal) before slash commands
  if (interaction.isButton() && interaction.customId === 'tactiopbot_start_verify') {
    const connectCmd = client.commands.get('connect');
    const cache = connectCmd?.verificationCache;
    if (!cache?.has(interaction.user.id)) {
      return interaction.reply({ content: '❌ Please run /connect again.', ephemeral: true });
    }

    const modal = new (require('discord.js').ModalBuilder)()
      .setCustomId('tactiopbot_verify_modal')
      .setTitle('Tacticool Verification');

    const { ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

    const killsInput = new TextInputBuilder()
      .setCustomId('modal_kills')
      .setLabel('Current kills on your account')

      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const matchesInput = new TextInputBuilder()
      .setCustomId('modal_matches')
      .setLabel('Total matches played')
      .setStyle(TextInputStyle.Short)

      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(killsInput),
      new ActionRowBuilder().addComponents(matchesInput)
    );

    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'tactiopbot_verify_modal') {
    const connectCmd = client.commands.get('connect');
    const cache = connectCmd?.verificationCache;
    const snap = cache?.get(interaction.user.id);

    if (!snap) {
    return interaction.reply({ content: '❌ Error. Please run `/connect` again.', ephemeral: true });
    }
    if (snap.expiresAt <= Date.now()) {
      cache.delete(interaction.user.id);
      return interaction.reply({ content: '⏳ Verification expired. Please run `/connect` again.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const inputKills = parseInt(interaction.fields.getTextInputValue('modal_kills'), 10);
    const inputMatches = parseInt(interaction.fields.getTextInputValue('modal_matches'), 10);

    const expectedKills = Number(snap.expected.kills);
    const expectedMatches = Number(snap.expected.matches);

    const isKillsCorrect = Math.abs(inputKills - expectedKills) <= 5;
    const isMatchesCorrect = Math.abs(inputMatches - expectedMatches) <= 2;

    if (!isKillsCorrect || !isMatchesCorrect) {
      cache.delete(interaction.user.id);
      return interaction.editReply({ content: '❌ Data does not match. Check your numbers in your Tacticool profile and try again.' });
    }

    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      const nickname = snap.expected.displayName;
      await member.setNickname(nickname);

      cache.delete(interaction.user.id);
      return interaction.editReply({ content: `✅ Verified! تم تغيير اسمك إلى: **${nickname}**` });
    } catch (err) {
      console.error('Nickname change failed:', err);
      cache.delete(interaction.user.id);
      return interaction.editReply({ content: '✅ Data is correct, but the bot could not change your nickname. Make sure it has Manage Nicknames permission and its role is higher.' });
    }
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;


  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Error executing command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Error executing command!", ephemeral: true });
      }
    } catch (err) {
      if (err.code === 10062 || err.code === 40060 || err.name === "InteractionNotReplied") {
        console.warn("Could not send error response to interaction:", err.code || err.name);
      } else {
        console.error("Failed to notify user about the error:", err);
      }
    }
  }
});

// ---------------- Discord Command + AI Replies ----------------
// Existing: !tacticool
// New: AI reply when mentioned or with random chance (~%1)
const { generateReply } = require("./openai_ai");

client.on("messageCreate", async (message) => {
  try {
    if (message.author.bot) return;

    const isTacticoolCmd = message.content === "!tacticool";
    if (!isTacticoolCmd) {
      // AI triggers
      const botUserId = client.user && client.user.id;
      const botTag = client.user && client.user.tag ? client.user.tag : '';

      const msgContent = (message.content || '').trim();

      // Mention trigger
      const mentioned =
        (message.mentions && botUserId ? message.mentions.has(botUserId) : false) ||
        (botUserId ? msgContent.includes(`<@${botUserId}>`) || msgContent.includes(`<@!${botUserId}>`) : false) ||
        (botTag ? msgContent.includes(`@${botTag}`) : false);

      // Reply-to-bot trigger (Discord reply threads)
      let repliedToBot = false;
      try {
        if (message.reference && message.reference.messageId) {
          const refMsg = await message.channel.messages.fetch(message.reference.messageId);
          repliedToBot = !!(refMsg && refMsg.author && botUserId && refMsg.author.id === botUserId);
        }
      } catch {
        // ignore fetch errors (no permissions / missing message)
      }

      // Random trigger (ONLY when not a command)
      const chancePercent = Number(process.env.AI_RANDOM_PERCENT || "1");
      const looksLikeCommand = msgContent.startsWith("!") || msgContent.startsWith("/");
      const shouldRandomReply = !looksLikeCommand && Math.random() * 100 < chancePercent;

      client._aiCooldown = client._aiCooldown || new Map();
      const now = Date.now();
      const cooldownKey = `${message.channel.id}:${message.author.id}`;
      const last = client._aiCooldown.get(cooldownKey) || 0;
      const cooldownMs = Number(process.env.AI_COOLDOWN_MS || "30000");
      const canReply = now - last >= cooldownMs;

      const shouldReply = canReply && (mentioned || repliedToBot || shouldRandomReply);
      if (!shouldReply) return;
      client._aiCooldown.set(cooldownKey, now);

      const systemPrompt =
        process.env.AI_SYSTEM_PROMPT ||
        "You are Tactiopbot, a helpful Discord bot for Tacticool. Keep replies short (1-3 sentences), friendly, and relevant. If user asks about stats or operators, be helpful.";

      const userText = msgContent
        .replace(new RegExp(`<@!?${botUserId}>`, "g"), "")
        .trim();

      const contextText = process.env.AI_CONTEXT || "If you are unsure, ask a short follow-up question.";

      let replyText = '';
      try {
        replyText = await generateReply({
          userText: userText || message.content,
          systemPrompt,
          contextText,
          maxTokens: Number(process.env.AI_MAX_TOKENS || "180"),
          temperature: Number(process.env.AI_TEMPERATURE || "0.8"),
        });
      } catch (err) {
        console.error('OpenAI generateReply failed:', err && err.message ? err.message : err);
        replyText = "Sorry—AI is having trouble right now.";
      }

      if (!replyText) return;
      return await message.reply({
        content: replyText.slice(0, 1900),
        allowedMentions: { repliedUser: false },
      });
    }

    // !tacticool command flow (disabled)
    await message.reply("ℹ️ Tacticool API is disabled in this build. Mention/reply to me to chat with AI.");
    return;

    const tacticool = result.data || {};


    const embed = new EmbedBuilder()
      .setTitle("📊 بيانات سيرفر Tacticool (Tactiopbot API)")
      .setColor(0x00ff00)
      .addFields(
        {
          name: "🆔 Player ID / Session",
          value: `\`${tacticool.playerId || "غير معروف"}\` ,`,
          inline: false,
        },
        {
          name: "🌍 السيرفرات المتاحة (Regions)",
          value:
            tacticool.regions && tacticool.regions.length ? tacticool.regions.join(", ") : "جاري الفحص...",
          inline: false,
        },
        {
          name: "🛒 عروض المتجر النشطة لـ حسابك",
          value:
            tacticool.shopOffers && tacticool.shopOffers.length
              ? tacticool.shopOffers.slice(0, 5).join("\\n")
              : "لا توجد عروض ملقوطة حالياً",
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({ text: "Tactiopbot Live Proxy" });

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error("!tacticool error:", error && error.message);
    await message.reply("❌ مش قادر ألقط الـ API، اتأكد إن tacticool_api.js شغال في ترمينال تاني!");
  }
});

client.login(DISCORD_TOKEN);

