import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import env from 'dotenv';
import { logger } from './utils/logger';
import { startup } from './handlers/startup';
import { voiceStateRouter } from './routers/voiceState';
import { interactionRouer } from './routers/interaction';
import { messageHandler } from './handlers/message';
import { channelUpdate } from './handlers/updateHandlers/channelUpdate';
import { guildMemberUpdate } from './handlers/updateHandlers/guildMemberUpdate';
env.config();

export const prisma = new PrismaClient();
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
}) as Client & {
  state: ClientState;
};
client.state = {
  connections: new Map<string, Connection>(),
  currentConnection: null,
  isPlayingMinecraft: null,
};

interface Connection {
  startTime: number;
  guildID: string;
}
export interface ClientState {
  connections: Map<
    string,
    {
      startTime: number;
      guildID: string;
    }
  >;
  currentConnection: VoiceState | null;
  isPlayingMinecraft: string | null;
}

client.once('ready', () => {
  startup();
});

process.on('uncaughtException', (ex) => {
  client.state.currentConnection?.disconnect();
  logger(ex.stack as string);
});

client.on('guildCreate', () => startup());
client.on('voiceStateUpdate', voiceStateRouter);
client.on('interactionCreate', interactionRouer);
client.on('messageCreate', messageHandler);
client.on('channelCreate', channelUpdate);
client.on('channelUpdate', (_, newChannel) => {
  if (newChannel.isDMBased()) {
    return;
  }

  channelUpdate(newChannel);
});
client.on('guildMemberAdd', guildMemberUpdate);
client.on('guildMemberUpdate', (_, newMember) => {
  guildMemberUpdate(newMember);
});

client.login(process.env.TOKEN);
