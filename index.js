// index.js
// NOTE: AI texting/reply cycle was removed. This file keeps only:
// - slash command handling
// - existing express endpoints used by the web dashboard
// - mission operator data fixes live in missionDataActive.js

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const express = require("express");
require("dotenv").config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

function loadCommandsFromFs() {
  const commandsDir = path.resolve(__dirname, "commands");
  let files = [];
  try {
    if (fs.existsSync(commandsDir)) {
      files = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"));
      for (const file of files) {
        const full = path.join(commandsDir, file);
        delete require.cache[require.resolve(full)];
        const command = require(full);
        if (command?.data?.name) client.commands.set(command.data.name, command);
      }
    }
  } catch (err) {
    console.error("Error while scanning commands:", err?.message || err);
  }
}

loadCommandsFromFs();

if (client.commands.size === 0) {
  try {
    const { SlashCommandBuilder } = require("discord.js");
    client.commands.set(
      "ping",
      {
        data: new SlashCommandBuilder().setName("ping").setDescription("Check bot is alive"),
        async execute(interaction) {
          await interaction.reply({ content: "Pong!", ephemeral: true });
        },
      }
    );
  } catch (e) {
    console.warn("Could not register fallback command:", e);
  }
}

async function registerCommands() {
  try {
    if (!DISCORD_TOKEN || !process.env.CLIENT_ID) return;

    const commands = Array.from(client.commands.values())
      .map((cmd) => cmd.data?.toJSON())
      .filter(Boolean);

    if (!commands.length) return;

    const { REST, Routes } = require("discord.js");
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    }
  } catch (err) {
    console.error("Failed to register commands:", err?.message || err);
  }
}

registerCommands().catch((err) => console.error("registerCommands failed:", err));

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  try {
    loadCommandsFromFs();
    console.log("clientReady: loaded commands:", Array.from(client.commands.keys()));
  } catch (err) {
    console.warn("clientReady: failed to re-load commands:", err?.message || err);
  }

  try {
    const { startScheduler } = require("./utils/clanMissionScheduler");
    startScheduler(client);
  } catch (err) {
    console.error("Failed to start clan mission scheduler:", err?.message || err);
  }
});

if (!DISCORD_TOKEN) {
  console.error("❌ Missing DISCORD_TOKEN in environment.");
  process.exit(1);
}

// === Express Web Server Setup ===
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🌐 running on http://localhost:${PORT}`);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || typeof command.autocomplete !== "function") return;
      await command.autocomplete(interaction);
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "❌ Error executing command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "❌ Error executing command!", ephemeral: true });
      }
    } catch {}
  }
});

process.on("SIGINT", async () => {
  try {
    await client.destroy();
  } finally {
    process.exit(0);
  }
});

process.on("SIGTERM", async () => {
  try {
    await client.destroy();
  } finally {
    process.exit(0);
  }
});

// Register commands from both local commands folder and moved TACTIAPI folder (if present)
try {
  const extraDir = path.resolve(__dirname, '..', '..', 'TACTIAPI');
  if (fs.existsSync(extraDir)) {
    const extraFiles = fs.readdirSync(extraDir).filter((f) => f.endsWith('.js'));
    for (const file of extraFiles) {
      const full = path.join(extraDir, file);
      delete require.cache[require.resolve(full)];
      const cmd = require(full);
      if (cmd?.data?.name) client.commands.set(cmd.data.name, cmd);
    }
  }
} catch (e) {
  console.warn('Extra command folder (TACTIAPI) not loaded:', e?.message || e);
}

client.login(DISCORD_TOKEN);



