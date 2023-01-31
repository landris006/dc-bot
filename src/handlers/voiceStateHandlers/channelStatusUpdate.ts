import { VoiceState } from 'discord.js';
import { io } from '../..';
import { getGuildChannelStatus } from '../../utils/getChannelStatus';

export const channelStatusUpdate = async (newState: VoiceState) => {
  const channels = newState.guild.channels.cache;

  io.in(newState.guild.id).emit('update', getGuildChannelStatus(channels));
};
