const { SlashCommandBuilder } = require('discord.js');

const { VoiceChannel } = require('discord.js');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');

const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Streams media from YouTube link to a Discord voice channel")
        .addStringOption(option => 
            option.setName('input')
            .setDescription('Enter your input here')
            .setRequired(true)),
    async execute(interaction) {
        const userInput = interaction.options.getString('input');
        
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) return interaction.reply('You need to be in a voice channel first!');

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        const stream = ytdl(userInput, { filter: 'audioonly' }); 
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy(); // Close the connection after playback has ended
        });

        stream.on('error', (error) => {
            console.error('Stream error:', error);
            connection.destroy();
            message.reply('Error playing the stream. Please try again.');
        });

        interaction.reply(`Playing: ${userInput}`);

        // await interaction.reply();
    },
};