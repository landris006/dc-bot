import { Client, GatewayIntentBits } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Connection } from './eventHandlers/voiceStateUpdate';
import { voiceStateUpdateHandlers } from './eventHandlers/voiceStateUpdate';
import { slashCommandInteractionHandlers } from './eventHandlers/slashCommandHandler';
import env from 'dotenv';
import { messageHandlers } from './eventHandlers/messageHandler';
import { logger } from './utils/logger';
env.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

export const prisma = new PrismaClient();

client.once('ready', () => {
  logger(`Logged in as ${client.user?.tag}!`);
});
process.on('uncaughtException', (ex) => {
  logger(ex.stack as string);
});

const connections = new Map<string, Connection>();
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channelId) {
    await voiceStateUpdateHandlers.handleConnection(connections, newState);
    return;
  }

  if (!newState.channelId) {
    await voiceStateUpdateHandlers.handleDisconnection(
      connections,
      newState,
      oldState.channel?.name as string
    );
    return;
  }

  if (
    oldState.channelId &&
    newState.channelId &&
    oldState.channelId !== newState.channelId
  ) {
    await voiceStateUpdateHandlers.handleChannelChange(
      newState,
      oldState.channel?.name as string
    );
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
    'banish',
    'level',
    'turtles',
  }

  await slashCommandInteractionHandlers[commandName as keyof typeof commands](
    interaction
  );
});

client.on('messageCreate', async (message) => {
  messageHandlers.messageHandler(message);
});

client.login(process.env.TOKEN);
