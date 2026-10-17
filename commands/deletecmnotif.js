const { SlashCommandBuilder } = require("discord.js");
const { deleteGuildConfig } = require("../utils/clanMissionNotifier");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletecmnotif")
    .setDescription("Delete the Clan Mission notification configuration"),

  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      return interaction.reply({
        content: "❌ This command can only be used in a server.",
        ephemeral: true,
      });
    }

    let existing;
    try {
      existing = await deleteGuildConfig(guildId);
    } catch (error) {
      console.error("[cm-notifications] Failed to delete guild settings:", error?.name || "Error");
      return interaction.reply({
        content: "❌ Could not delete the notification configuration. Please try again later.",
        ephemeral: true,
      });
    }

    if (!existing) {
      return interaction.reply({
        content: "❌ No notification configuration found to delete.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: "✅ Clan Mission notification configuration has been deleted.",
      ephemeral: true,
    });
  },
};