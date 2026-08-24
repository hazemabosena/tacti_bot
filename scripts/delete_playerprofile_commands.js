const { Client, GatewayIntentBits, Routes } = require('discord.js');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN/TOKEN in environment (.env).');
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error('Missing CLIENT_ID in environment (.env).');
  process.exit(1);
}


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function deleteCommands() {
  try {
    const rest = new (require('discord.js').REST)({ version: '10' }).setToken(DISCORD_TOKEN);

    // Delete global commands
    if (!GUILD_ID) {
      const globalCommands = await rest.get(Routes.applicationCommands(CLIENT_ID));
      for (const cmd of globalCommands) {
        await rest.delete(Routes.applicationCommand(CLIENT_ID, cmd.id));
        console.log(`Deleted global command /${cmd.name}`);
      }
      console.log(`Deleted ${globalCommands.length} global commands`);
    }

    // Delete guild-specific commands
    if (GUILD_ID) {
      const guildCommands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
      for (const cmd of guildCommands) {
        await rest.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, cmd.id));
        console.log(`Deleted guild command /${cmd.name}`);
      }
      console.log(`Deleted ${guildCommands.length} guild commands`);
    }

    console.log('✅ Command deletion completed');
  } catch (err) {
    console.error('Deletion script failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await client.destroy();
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await deleteCommands();
});

client.login(DISCORD_TOKEN);

