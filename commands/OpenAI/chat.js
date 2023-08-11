const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chat")
        .setDescription("Sends prompt to ChatGPT")
        .addStringOption(option => 
            option.setName('input')
            .setDescription('Enter your input here')
            .setRequired(true)),
    async execute(interaction) {
        const userInput = interaction.options.getString('input');
        
        // Do something with the user input
        await interaction.reply(`You entered: ${userInput}`);
    },
};