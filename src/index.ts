import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Connection } from './eventHandlers/voiceStateUpdate';
import { voiceStateUpdateHandlers } from './eventHandlers/voiceStateUpdate';
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
  if ((oldState.channelId && newState.channelId) || !newState.member) {
    return;
  }

  if (!oldState.channelId) {
    await voiceStateUpdateHandlers.handleConnection(connections, newState);
    return;
  }

  if (!newState.channelId) {
    voiceStateUpdateHandlers.handleDisconnection(connections, newState);
  }
});

client.login(process.env.TOKEN);
