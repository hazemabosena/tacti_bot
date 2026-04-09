const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getPlayerData } = require('../tacti_view/playerData');
const { generatePlayerImage } = require('../tacti_view/generatePlayerImage');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view')
		.setDescription('View player stats card')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('Player ID (e.g., QUYUYFQG, gabigol)')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

		const id = interaction.options.getString('id');
		let player = await getPlayerData(id); // async scrape/mock

		if (!player) {
			return interaction.editReply({ content: `❌ Player \`${id}\` not found.` });
		}

		let buffer = null;
		try {
			buffer = await generatePlayerImage(player);
		} catch (error) {
			console.error('Image gen error:', error.message);
		}
		
		if (buffer) {
			const attachment = new AttachmentBuilder(buffer, { name: 'player_card.png' });
			return await interaction.editReply({ files: [attachment] });
		}
		
		// Fallback text stats (safe nulls)
		const safeStats = Array.isArray(player.stats) ? player.stats : [];
		const statsText = `**${player.name || 'Unknown'}** (Lv${player.level || '?'} | ${player.rating || '?'} RR | ${player.kills || 0} Kills | ${(player.kdr || 0).toFixed(2)} K/D)\n**Clan:** ${player.clan || 'Solo'}\n${safeStats.join('\n')}`;
		await interaction.editReply({ content: statsText });
	},
};

