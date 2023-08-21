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

const conversationLog = [{ role: 'system', content: 'You are a sarcastic discord chatbot that keeps its responses to less than 1000 characters.' }];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Sends prompt to ChatGPT')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('Enter your input here')
				.setRequired(true)),
	async execute(interaction) {
		const userInput = interaction.options.getString('input');
		await interaction.channel.sendTyping();

		conversationLog.push({
			role: 'user',
			content: userInput,
		});

		const result = await openai.createChatCompletion({
			model: 'gpt-3.5-turbo',
			messages: conversationLog,
		});

		await interaction.reply(result.data.choices[0].message);
	},
};