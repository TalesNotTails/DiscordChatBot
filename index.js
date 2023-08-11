// require fs and path modules from node
const fs = require('node:fs');
const path = require('node:path');

// Require the necessary openai classes
const { Configuration, OpenAIApi } = require('openai');

// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, Message, IntentsBitField } = require('discord.js');

// Require variabled from config file
const { token, channelID, openaikey } = require('./config.json');

// Create new configuration with apikey
const configuration = new Configuration({
	apiKey: openaikey,
});

// Use config to create new OpenAIAPI class
const openai = new OpenAIApi(configuration);

// Create a new client instance for Discord bot with intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	] 
});
	
// Create new collection for discord commands
client.commands = new Collection();

// Create path to commands folder and read nested folders
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Imports js files from subfolders into the commands collection for the Discord bot
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}

		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	// console.log(interaction)

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}

	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}

		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on('messageCreate', async (message) => {
	// console.log(message);
	if (message.author.bot) return;
	if (message.channel.id !== channelID) return;
	if (message.content.startsWith('!')) return;

	let conversationLog = [{ role: 'system', content: 'You are a sarcastic discord chatbot that keeps its responses to less than 1000 characters.' }];

	conversationLog.push({
		role: 'user',
		content: message.content,
	});

	await message.channel.sendTyping();

	const result = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: conversationLog,
	});

	message.reply(result.data.choices[0].message);
});

// Log in to Discord with your client's token
client.login(token);
