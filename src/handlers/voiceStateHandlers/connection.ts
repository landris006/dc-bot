import { prisma } from '../../index';
import { VoiceState } from 'discord.js';
import { logger } from '../../utils/logger';

export const connection = async (newState: VoiceState) => {
  const member = newState.member;
  const channel = newState.channel;
  if (!member || !channel) {
    return;
  }

  const guildMember = await prisma.guildMember.findFirst({
    where: { guildId: member.guild.id, userId: member.user.id },
  });
  if (!guildMember) {
    return;
  }

  // quickly connecting and disconnecting can cause duplicate connections
  await prisma.connection.deleteMany({
    where: {
      guildMemberId: guildMember.id,
      endTime: null,
    },
  });

  await prisma.connection.create({
    data: {
      guildMemberId: guildMember.id,
      voiceChannelId: channel.id,
    },
  });

  await logger(`${member.nickname} connected to '${channel.name}'`);
};
