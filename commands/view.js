const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchTacticoolPlayerMeta } = require('../tacti_view/tacticoolMeta');
const { parsePlayerData } = require('../scripts/parser');
const { buildProfileEmbed } = require('../scripts/profileEmbed');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('view')
    .setDescription('View player stats (live packet.bin parsing)')
    .addStringOption((option) =>
      option.setName('id').setDescription('Player ID (Public ID)').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const id = interaction.options.getString('id');
    const meta = await fetchTacticoolPlayerMeta(id);

    if (!meta) {
      return interaction.editReply({ content: `❌ Player \`${id}\` not found.` });
    }

    const fmt = (v, placeholder) => (v == null ? placeholder : String(v));

    // Best-effort protobuf decode:
    // - tacticoolMeta.js currently only extracts text-based fields.
    // - we will try to decode the latest packet.bin file if it exists.
    let protobufPlayer = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const packetsDir = path.join(__dirname, '..', 'packet.bin');
      if (fs.existsSync(packetsDir)) {
        const entries = fs.readdirSync(packetsDir);
        const bins = entries.filter((e) => e.endsWith('.bin'));
        if (bins.length) {
          let newest = null;
          let newestTime = 0;
          for (const f of bins) {
            const full = path.join(packetsDir, f);
            const stat = fs.statSync(full);
            if (stat.mtimeMs > newestTime) {
              newestTime = stat.mtimeMs;
              newest = full;
            }
          }
          if (newest) {
            const buf = fs.readFileSync(newest);
            protobufPlayer = await parsePlayerData(buf);
          }
        }
      }
    } catch (e) {
      protobufPlayer = null;
    }

    // If protobuf decode succeeded, use it.
    if (protobufPlayer) {
      const payload = buildProfileEmbed(protobufPlayer);
      const embed = new EmbedBuilder(payload);
      // EmbedBuilder doesn't accept `timestamp` as Date in every version reliably,
      // but it is safe to setTimestamp separately.
      if (payload.timestamp) embed.setTimestamp(payload.timestamp);
      return interaction.editReply({ embeds: [embed] });
    }

    // Fallback to existing heuristic embed.
    const lossesSafe = Number(meta.losses ?? 0);
    const killsSafe = Number(meta.kills ?? 0);
    const kd = lossesSafe > 0 ? killsSafe / lossesSafe : null;

    const embed = new EmbedBuilder()
      .setTitle(`🎮 Player Profile: ${meta.displayName}`)
      .setColor(0x00ff00)
      .addFields(
        { name: '🆔 Player ID', value: `\`${id}\``, inline: false },
        { name: '🛡️ Clan', value: meta.clanName || 'Reading...', inline: true },
        { name: '⭐ Rating', value: fmt(meta.rating, 'Reading...'), inline: true },
        {
          name: '📊 Level',
          value: meta.level
            ? `${meta.level}${meta.levelBorder ? ` (${meta.levelBorder})` : ''}`
            : 'Reading...',
          inline: true,
        },
        { name: '⚔️ Kills', value: fmt(meta.kills, 'Reading...'), inline: true },
        {
          name: '💀 Kills/Losses (proxy K/D)',
          value: kd == null ? 'Reading...' : kd.toFixed(2),
          inline: true,
        },
        { name: '🕹️ Matches', value: fmt(meta.matches, 'Reading...'), inline: true }
      )
      .setTimestamp();

    if (meta.avatar) embed.setThumbnail(meta.avatar);

    return interaction.editReply({ embeds: [embed] });

  },
};

