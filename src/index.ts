import { Client, GatewayIntentBits, VoiceState } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import env from 'dotenv';
import { logger } from './utils/logger';
import { eventRouter as buildEventRouter } from './routers/events';
import { webSocketRouter as buildWebsocketRouter } from './routers/websocket';
env.config();

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
}) as Client & {
  state: ClientState;
};
client.state = {
  currentConnection: null,
  isPlayingMinecraft: null,
};

export interface ClientState {
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
buildWebsocketRouter(io);

buildEventRouter(client);

process.on('uncaughtException', (error) => {
  client.state.currentConnection?.disconnect();
  logger(error.stack as string);
});

client.login(process.env.TOKEN);
