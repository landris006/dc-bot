import { Socket } from 'socket.io';
import { client } from '..';
import { getGuildChannelStatus } from '../utils/getChannelStatus';

export const subscribe = async (socket: Socket, guildID: string) => {
  if (typeof guildID !== 'string') {
    socket.emit('error', "'guildID' is not a string...");
    return;
  }

  const guild = client.guilds.cache.get(guildID);

  if (!guild) {
    socket.emit('error', "'guildID' is not valid...");
    return;
  }

  socket.emit('update', getGuildChannelStatus(guild.channels.cache));
  socket.join(guild.id);
};
