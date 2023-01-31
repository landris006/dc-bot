import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import env from 'dotenv';
import { logger } from './utils/logger';
import { eventRouter } from './routers/events';
import { webSocketRouter } from './routers/websocket';
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

const PORT = process.env.PORT || 5000;
export const io = new Server(+PORT, {
  cors: {
    origin: process.env.CORS_URL,
    credentials: true,
  },
});
webSocketRouter(io);

eventRouter(client);

process.on('uncaughtException', (ex) => {
  client.state.currentConnection?.disconnect();
  logger(ex.stack as string);
});

client.login(process.env.TOKEN);
