import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
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

export const prisma = new PrismaClient();

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

const connections = new Map<string, Connection>();
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (oldState.channelId && newState.channelId) {
    return;
  }

  await voiceStateUpdateHandler(oldState, newState, connections);
});

client.login(process.env.TOKEN);
