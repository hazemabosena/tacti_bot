const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function missingDiscordFile() {
  let entryPath;
  try {
    entryPath = require.resolve("discord.js");
  } catch (error) {
    return "discord.js";
  }

  const packageRoot = path.resolve(path.dirname(entryPath), "..");
  const webhookClientPath = path.join(packageRoot, "src", "client", "WebhookClient.js");
  return fs.existsSync(webhookClientPath) ? null : webhookClientPath;
}

const missing = missingDiscordFile();
if (!missing) {
  process.exit(0);
}

console.warn(`[startup] Discord.js install is incomplete; missing ${missing}. Reinstalling discord.js...`);

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npmCommand, ["install", "discord.js@14.25.1", "--no-save"], {
  stdio: "inherit",
  shell: false
});

if (result.status !== 0) {
  console.error("[startup] Could not repair discord.js install.");
  process.exit(result.status || 1);
}

const stillMissing = missingDiscordFile();
if (stillMissing) {
  console.error(`[startup] Discord.js is still incomplete; missing ${stillMissing}.`);
  process.exit(1);
}
