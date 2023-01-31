import { io } from '..';
import { subscribe } from '../handlers/websocket';
import { logger } from '../utils/logger';
import { Server } from 'socket.io';

export const webSocketRouter = (io: Server) => {
  io.on('connection', (socket) => {
    logger('New websocket connection!');

    socket.on('subscribe', (guildID: string) => {
      subscribe(socket, guildID);
    });

    socket.on('disconnect', (reason) => {
      logger(`Socket disconnected. Reason: ${reason}`);
    });
  });
};
