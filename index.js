// require fs and path modules from node
const fs = require('node:fs');
const path = require('node:path');

const fetch = require('node-fetch');

// Require the necessary discord.js classes
const { Client, Collection, Events, GatewayIntentBits, Message, IntentsBitField } = require('discord.js');

// Require variables from config file
const { token, spotifyID, spotifyKey } = require('./config.json');

// Create a new client instance for Discord bot with intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
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

async function getSpotifyAccessToken(clientId, clientSecret) {
	const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Authorization': `Basic ${creds}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=client_credentials'
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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

module.exports = {
	accessToken,
	getSongDetailsFromLink,
};