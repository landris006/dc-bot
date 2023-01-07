import {
  ActivityType,
  Client,
  GatewayIntentBits,
  GuildMember,
  VoiceState,
} from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Connection } from './eventHandlers/voiceStateUpdate';
import { VoiceStateUpdateHandlers } from './eventHandlers/voiceStateUpdate';
import { SlashCommandInteractionHandlers } from './eventHandlers/slashCommandHandlers';
import env from 'dotenv';
import { MessageHandlers } from './eventHandlers/messageHandler';
import { logger } from './utils/logger';
import { upsertMember } from './utils/upsertMember';
env.config();

export const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  client.user?.setActivity({
    name: 'with your mom',
    type: ActivityType.Playing,
  });

  Promise.all(
    client.guilds.cache.map(async (guild) => {
      const iconURL = guild.iconURL();

      const members = await guild.members.fetch();
      await Promise.all(
        members.map((member) => {
          if (member.user.bot) {
            return;
          }

          return upsertMember({
            guildID: guild.id,
            userID: member.user.id,
            username: member.user.username,
            nickname: member.nickname,
            avatarURL: member.user.avatarURL(),
            joinedAt: member.joinedAt,
          });
        })
      );

      return prisma.guild.upsert({
        where: { id: guild.id },
        update: { name: guild.name, iconURL },
        create: {
          id: guild.id,
          name: guild.name,
          iconURL,
          createdAt: guild.createdAt,
        },
      });
    })
  );

  logger(`Logged in as ${client.user?.tag}!`);
});

process.on('uncaughtException', (ex) => {
  clientState.currentConnection?.disconnect();
  logger(ex.stack as string);
});

export interface State {
  connections: Map<string, Connection>;
  currentConnection: VoiceState | null;
  isPlayingMinecraft: string | null;
}

const clientState: State = {
  connections: new Map<string, Connection>(),
  currentConnection: null,
  isPlayingMinecraft: null,
};

client.on('voiceStateUpdate', async (oldState, newState) => {
  const botID = process.env.CLIENT_ID;
  // Other bot connect
  if (newState.member?.user.bot && newState.member.user.id !== botID) {
    return;
  }

  // Bot connect
  if (!oldState.channelId && newState.member?.user.id === botID) {
    clientState.currentConnection = newState?.member?.voice as VoiceState;
    return;
  }

  // Bot disconnect
  if (oldState.member?.user.id === botID && !newState.channelId) {
    clientState.currentConnection = null;
    clientState.isPlayingMinecraft = null;
    return;
  }

  if (newState.channelId === clientState.isPlayingMinecraft) {
    VoiceStateUpdateHandlers.handleMinecraft(oldState, newState, clientState);
  }

  if (!oldState.channelId) {
    VoiceStateUpdateHandlers.handleConnection(
      clientState.connections,
      newState
    );
    return;
  }

  if (!newState.channelId) {
    VoiceStateUpdateHandlers.handleDisconnection(
      clientState.connections,
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
    VoiceStateUpdateHandlers.handleChannelChange(
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

  const commandName = interaction.commandName as Commands;

  type Commands =
    | 'ping'
    | 'banish'
    | 'level'
    | 'turtles'
    | 'minecraft'
    | 'leave';

  await logger(
    `${
      (interaction.member as GuildMember).nickname
    } used the '/${commandName}' command!`
  );

  await SlashCommandInteractionHandlers[commandName](interaction, clientState);

  setTimeout(() => {
    interaction.deleteReply();
  }, 10000);
});

client.on('messageCreate', async (message) => {
  if (message.member?.user.bot) {
    return;
  }

  MessageHandlers.messageHandler(message);
});

client.login(process.env.TOKEN);
