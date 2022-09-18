import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import {
  voiceStateUpdateHandler,
  Connection,
} from './eventHandlers/voiceStateUpdate';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

let connections: Connection[] = [];
client.on('voiceStateUpdate', (oldState, newState) => {
  connections = voiceStateUpdateHandler(oldState, newState, connections);
  console.log(connections);
});

client.login(process.env.TOKEN);
