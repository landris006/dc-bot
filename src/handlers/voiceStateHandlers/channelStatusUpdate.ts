import { VoiceState } from 'discord.js';
import { io } from '../..';

export const channelStatusUpdate = async (newState: VoiceState) => {
  const channels = newState.guild.channels.cache;

  const status = channels.reduce<{
    [key: string]: string[];
  }>((status, channel) => {
    if (!channel.isVoiceBased()) {
      return status;
    }

    status[channel.id] = channel.members.map((member) => member.user.id);

    return status;
  }, {});

  io.in(newState.guild.id).emit('update', status);
};
