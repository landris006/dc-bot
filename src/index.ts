import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Connection } from './eventHandlers/voiceStateUpdate';
import { voiceStateUpdateHandlers } from './eventHandlers/voiceStateUpdate';
import { slashCommandInteractionHandlers } from './eventHandlers/slashCommandHandler';
import env from 'dotenv';
env.config();

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
  if (!oldState.channelId) {
    await voiceStateUpdateHandlers.handleConnection(connections, newState);
    return;
  }

  if (!newState.channelId) {
    await voiceStateUpdateHandlers.handleDisconnection(connections, newState);
    return;
  }

  if (oldState.channelId && newState.channelId) {
    await voiceStateUpdateHandlers.handleChannelChange(newState);
    return;
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const { commandName } = interaction;

  enum commands {
    'ping',
  }

  await slashCommandInteractionHandlers[commandName as keyof typeof commands](
    interaction
  );
});

client.login(process.env.TOKEN);
