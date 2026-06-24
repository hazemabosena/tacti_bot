const { SlashCommandBuilder } = require("discord.js");
const { getGuildConfig, getNextReset, formatResetDate } = require("../utils/clanMissionNotifier");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reminderstatus")
    .setDescription("Shows the current Clan Mission notification configuration"),

  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const config = getGuildConfig(guildId);
    if (!config) {
      return interaction.reply({
        content: "❌ No notification configuration found. Use `/setcmnotif` to create one.",
        ephemeral: true,
      });
    }

    const channelMention = config.channelId ? `<#${config.channelId}>` : "Not set";
    const roleMention = config.roleId ? `<@&${config.roleId}>` : "None";
    const enabledStatus = config.enabled ? "Yes" : "No";
    const language = config.language || "English";
    const nextReset = new Date(config.nextReset);
    const formattedDate = formatResetDate(nextReset);

    await interaction.reply({
      content: `**Clan Mission Notification Status**\n\nChannel: ${channelMention}\nRole: ${roleMention}\nEnabled: ${enabledStatus}\nLanguage: ${language}\n\nNext Reset:\n${formattedDate}`,
      ephemeral: true,
    });
  },
};