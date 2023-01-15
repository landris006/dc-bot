import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import env from 'dotenv';
import { logger } from './utils/logger';
import { startup } from './handlers/startup';
import { voiceStateRouter } from './routers/voiceState';
import { interactionRouer } from './routers/interaction';
import { messageHandler } from './handlers/messageHandler';
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

client.on('voiceStateUpdate', voiceStateRouter);
client.on('interactionCreate', interactionRouer);
client.on('messageCreate', async (message) => {
  if (message.member?.user.bot) {
    return;
  }

  messageHandler(message);
});

client.login(process.env.TOKEN);
