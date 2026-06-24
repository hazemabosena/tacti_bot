const { SlashCommandBuilder, ChannelType } = require("discord.js");
const {
  getGuildConfig,
  setGuildConfig
} = require("../utils/clanMissionNotifier");
const { getLanguageChoices } = require("../utils/cmNotificationLanguages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editcmnotif")
    .setDescription("Edit an existing Clan Mission notification configuration")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("New channel where notifications will be sent")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("New role to ping when missions reset")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("enabled")
        .setDescription("Enable or disable notifications")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription("Language for the notification message")
        .setRequired(false)
        .addChoices(getLanguageChoices())
    ),

  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true,
      });
    }

    const existing = getGuildConfig(guildId);
    if (!existing) {
      return interaction.reply({
        content: "❌ No notification configuration found. Use `/setcmnotif` to create one first.",
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");
    const enabled = interaction.options.getBoolean("enabled");
    const language = interaction.options.getString("language");

    const updated = {
      guildId: existing.guildId,
      channelId: channel ? channel.id : existing.channelId,
      roleId: role !== null ? role.id : existing.roleId,
      enabled: enabled !== null ? enabled : existing.enabled,
      language: language || existing.language,
      nextReset: existing.nextReset,
    };

    setGuildConfig(guildId, updated);

    const channelMention = channel ? channel : `<#${existing.channelId}>`;
    const roleMention = role ? role : (existing.roleId ? `<@&${existing.roleId}>` : "None");

    await interaction.reply({
      content: `✅ Notification configuration updated!\nChannel: ${channelMention}\nRole: ${roleMention}\nEnabled: ${updated.enabled ? "Yes" : "No"}\nLanguage: ${updated.language}`,
      ephemeral: true,
    });
  },
};