const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const scrapeDice = require("./scrapers/scrapeDice");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// client.login(token);

// Build stuff for web scraper

const params = {
  q: "devops",
  location: "Wilmington, DE, USA",
  page: 1,
  pageSize: 100,
  "filters.postedDate": "ONE",
  "filters.workplaceTypes": "Remote",
  language: "en",
};

scrapeDice(params).then((links) => {
  links.map((link) => {
    console.log(`https://www.dice.com/job-detail/${link}`);
  });
});
