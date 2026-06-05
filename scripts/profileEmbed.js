function buildProfileEmbed(player, { interaction } = {}) {
  const totalMatches = Number(player?.matchesCount ?? 0) || 0;
  const wins = Number(player?.winsCount ?? 0) || 0;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

  const flagEmoji = player?.countryCode
    ? `:flag_${String(player.countryCode).toLowerCase()}:`
    : "🌐";

  const playtimeHours = ((Number(player?.totalMatchTime ?? 0) || 0) / 3600).toFixed(1);

  return {
    color: 0x0099ff,
    title: `🎮 Player Profile: ${player?.name || "Unknown"}`,
    description: `🆔 ID: \`${player?.playerId || "N/A"}\` | 🌍 Region: ${flagEmoji}`,
    fields: [
      { name: "🏆 Trophies / Rating", value: `${player?.rating ?? 0}`, inline: true },
      { name: "⭐ Level", value: `${player?.level ?? 0}`, inline: true },
      { name: "📊 Win Rate", value: `${winRate}% (${wins} Wins)`, inline: true },
      { name: "⚔️ Total Kills", value: `${player?.totalKills ?? 0}`, inline: true },
      { name: "🤝 Assists", value: `${player?.assists ?? 0}`, inline: true },
      { name: "🕒 Playtime", value: `${playtimeHours} Hours`, inline: true },
    ],
    timestamp: new Date(),
  };
}

module.exports = { buildProfileEmbed };

