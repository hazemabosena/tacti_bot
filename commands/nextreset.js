const { SlashCommandBuilder } = require("discord.js");
const { getNextReset, getTimeRemaining, formatResetDate } = require("../utils/clanMissionNotifier");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nextreset")
    .setDescription("Shows when the next Clan Mission reset will occur"),

  async execute(interaction) {
    const nextReset = getNextReset();
    const timeRemaining = getTimeRemaining(nextReset);
    const formattedDate = formatResetDate(nextReset);

    await interaction.reply({
      content: `⏰ **Next Clan Mission Reset**\n\n${timeRemaining}\n${formattedDate}`,
      ephemeral: true,
    });
  },
};