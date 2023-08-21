const { SlashCommandBuilder } = require('discord.js');

const { VoiceChannel } = require('discord.js');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');

const fetch = require('node-fetch');

const ytdl = require('ytdl-core');

const { spotifyID, spotifyKey } = require('../../config.json');

async function getSpotifyAccessToken(clientId, clientSecret) {
	const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${creds}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: 'grant_type=client_credentials',
	});

	const data = await response.json();
	return data.access_token;
}

async function getSongDetailsFromLink(link, accessToken) {
	// Extract the track ID from the Spotify link
	const trackId = link.split('track/')[1].split('?')[0];
	const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
		headers: {
			'Authorization': `Bearer ${accessToken}`,
		},
	});

	const data = await response.json();
	return data;
}

const accessToken = getSpotifyAccessToken(spotifyID, spotifyKey);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Streams media from a YouTube link to a Discord voice channel')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Enter your input here')
				.setRequired(true)),
	async execute(interaction) {

		const userInput = interaction.options.getString('input');

		if (userInput.includes('spotify.com')) {
			console.log('Spotify link detected');
			const songDetails = await getSongDetailsFromLink(userInput, accessToken);
			console.log(songDetails);
		}

		if (userInput.includes('youtu.be')) {

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
			console.log('Please enter a youtube or spotify link');
		}

		// await interaction.reply();
	},
};