import { Collection } from '@discordjs/collection';
import { GuildBasedChannel } from 'discord.js';

export const getGuildChannelStatus = (channels: Collection<string, GuildBasedChannel>) => {
  return channels.reduce<{
    [key: string]: { id: string; muted: boolean; deafened: boolean }[];
  }>((status, channel) => {
    if (!channel.isVoiceBased()) {
      return status;
    }

    status[channel.id] = channel.members.map((member) => ({
      id: member.user.id,
      muted: member.voice.mute ?? false,
      deafened: member.voice.deaf ?? false,
      streaming: member.voice.streaming ?? false,
    }));

    return status;
  }, {});
};
