import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});
