const { SlashCommandBuilder, ChannelType } = require("discord.js");
const {
  getGuildConfig,
  setGuildConfig,
  getNextReset
} = require("../utils/clanMissionNotifier");
const { getLanguageChoices } = require("../utils/cmNotificationLanguages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setcmnotif")
    .setDescription("Create automatic Clan Mission reset notifications")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel where notifications will be sent")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role to ping when missions reset (optional)")
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

    const channel = interaction.options.getChannel("channel");
    const role = interaction.options.getRole("role");
    const enabled = interaction.options.getBoolean("enabled") ?? true;
    const language = interaction.options.getString("language") || "English";

    const nextReset = getNextReset();

    const config = {
      guildId,
      channelId: channel.id,
      roleId: role ? role.id : null,
      enabled,
      language,
      nextReset: nextReset.toISOString(),
    };

    setGuildConfig(guildId, config);

    const roleMention = role ? `\nRole: ${role}` : "\nRole: None";
    await interaction.reply({
      content: `✅ Clan Mission notification configured!\nChannel: ${channel}\n${roleMention}\nEnabled: ${enabled ? "Yes" : "No"}\nLanguage: ${language}\nNext Reset: ${nextReset.toLocaleString("en-US", { timeZone: "Africa/Cairo" })}`,
      ephemeral: true,
    });
  },
};