const { SlashCommandBuilder } = require('discord.js');
const { VoiceChannel } = require('discord.js');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { mediaChannelID } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Streams media from a YouTube link to a Discord voice channel')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Enter your input here')
				.setRequired(true)),
	async execute(interaction) {

		if (interaction.channel.id !== mediaChannelID) {
			await interaction.reply('Please enter prompt in medial playback channel');
			return;
		}

		const userInput = interaction.options.getString('input');

		if (userInput.includes('youtu.be') || userInput.includes('youtube.com')) {

			console.log('YouTube link detected');

			const voiceChannel = interaction.member.voice.channel;
			if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) return interaction.reply('You need to be in a voice channel first!');

			const connection = joinVoiceChannel({
				channelId: voiceChannel.id,
				guildId: voiceChannel.guild.id,
				adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			});

			const stream = ytdl(userInput, { filter: 'audioonly' });
			const resource = createAudioResource(stream);
			const player = createAudioPlayer();

			player.play(resource);
			connection.subscribe(player);

			// Close the connection after playback has ended
			player.on(AudioPlayerStatus.Idle, () => {
				connection.destroy();
			});

			stream.on('error', (error) => {
				console.error('Stream error:', error);
				connection.destroy();
				interaction.reply('Error playing the stream. Please try again.');
			});

			interaction.reply(`Playing: ${userInput}`);
		}

		else {
			console.log('Please enter a youtube link');
		}

		// await interaction.reply();
	},
};