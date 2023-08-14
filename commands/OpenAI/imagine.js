const { SlashCommandBuilder } = require('discord.js');

// Require the necessary openai classes
const { Configuration, OpenAIApi } = require('openai');

// Require variabled from config file
const { openaikey } = require('../../config.json');

// Create new configuration with apikey
const configuration = new Configuration({
	apiKey: openaikey,
});

// Use config to create new OpenAIAPI class
const openai = new OpenAIApi(configuration);

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imagine")
        .setDescription("Sends prompt to DALL-E")
        .addStringOption(option => 
            option.setName('input')
            .setDescription('Enter your input here')
            .setRequired(true)),
    async execute(interaction) {
        try{
            const userInput = interaction.options.getString('input');

            await interaction.deferReply();

            await interaction.channel.sendTyping();

            const result = await openai.createImage({
                prompt: userInput,
                n: 1,
                size: "1024x1024",
            });

            console.log(result.data);

            imageurl = result.data.data[0].url;

            await interaction.editReply(imageurl);
        } 
        
        catch (err) {
            console.error("Error while generating image:", err);
            await interaction.editReply('An error occurred while generating the image.');
        }
        
    },
};