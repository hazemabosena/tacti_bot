const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const { fetchTacticoolPlayerMeta } = require('../tacti_view/tacticoolMeta');

// In-memory cache: Discord user -> verification snapshot
// TTL keeps memory bounded.
const verificationCache = new Map();
const TTL_MS = 5 * 60 * 1000;

function setCache(userId, value) {
  verificationCache.set(userId, value);

  // TTL cleanup (best effort)
  setTimeout(() => {
    const cur = verificationCache.get(userId);
    if (cur && cur.expiresAt <= Date.now()) verificationCache.delete(userId);
  }, TTL_MS + 2000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect between Tacticool and Discord')
    .addStringOption((option) =>
      option
        .setName('id')
        .setDescription('Your Tacticool Player ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerId = interaction.options.getString('id');

    // Step 1: fetch expected stats from live packet.bin parser
    const meta = await fetchTacticoolPlayerMeta(playerId);

    // If we have no parsed data, we can't verify yet.
    const hasExpected =
      meta && meta.displayName && meta.kills != null && meta.matches != null;

    if (!hasExpected) {
      return interaction.reply({
        content:
          '⏳ لسه البوت ما قدرش يقرا بياناتك من packet.bin.\n' +
          'افتح بروفايلك في اللعبة لحد ما السنiffer يلقط الاسم/الKills/المatches، وبعدين اعمل /connect تاني.',
        ephemeral: true,
      });
    }

    const expiresAt = Date.now() + TTL_MS;
    setCache(interaction.user.id, {
      playerId,
      expected: {
        kills: meta.kills,
        matches: meta.matches,
        displayName: meta.displayName,
      },
      expiresAt,
    });

    // Step 2: ephemeral message (only user sees)
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('tactiopbot_start_verify')
        .setLabel('Verify 🔓')
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      content:
        `Hello **${meta.displayName}** 👋\n` +
        'Press the button, then enter your current Kills and Matches to verify ownership.',
      components: [row],
      ephemeral: true,
    });
  },

  // Helpers for index.js event handler
  verificationCache,
  TTL_MS,
};

