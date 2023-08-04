import { NonThreadGuildBasedChannel } from 'discord.js';
import { prisma } from '../..';

export const channelUpdate = async (channel: NonThreadGuildBasedChannel) => {
  if (channel.isVoiceBased()) {
    await prisma.voiceChannel.upsert({
      where: { id: channel.id },
      update: { name: channel.name, guildId: channel.guild.id },
      create: {
        id: channel.id,
        name: channel.name,
        guildId: channel.guild.id,
      },
    });

    return;
  }

  if (channel.isTextBased()) {
    await prisma.textChannel.upsert({
      where: { id: channel.id },
      update: { name: channel.name, guildId: channel.guild.id },
      create: {
        id: channel.id,
        name: channel.name,
        guildId: channel.guild.id,
      },
    });

    return;
  }
};
