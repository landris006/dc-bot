import { Socket } from 'socket.io';
import { client } from '..';
import { getGuildChannelStatus } from '../utils/getChannelStatus';

export const init = async (socket: Socket) => {
  const guildId = socket.handshake.query.guildId;

  if (typeof guildId !== 'string') {
    socket.emit('error', "'guildId' is not a string...");
    return;
  }

  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    socket.emit('error', "'guildId' is not valid...");
    return;
  }

  socket.emit('update', getGuildChannelStatus(guild.channels.cache));
  await socket.join(guild.id);
};
