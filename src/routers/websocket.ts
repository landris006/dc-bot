import { init } from '../handlers/websocket';
import { logger } from '../utils/logger';
import { Server } from 'socket.io';

export const webSocketRouter = (io: Server) => {
  io.on('connection', async (socket) => {
    await init(socket);

    socket.on('disconnect', (reason) => {
      logger(`Socket disconnected. Reason: ${reason}`);
    });

    await logger('New websocket connection!');
  });
};
