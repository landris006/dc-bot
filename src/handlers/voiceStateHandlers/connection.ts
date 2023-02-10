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
    where: { guildID: member.guild.id, userID: member.user.id },
  });
  if (!guildMember) {
    return;
  }

  // quickly connecting and disconnecting can cause duplicate connections
  await prisma.connection.deleteMany({
    where: {
      guildMemberID: guildMember.id,
      endTime: null,
    },
  });

  await prisma.connection.create({
    data: {
      guildMemberID: guildMember.id,
      voiceChannelID: channel.id,
    },
  });

  await logger(`${member.nickname} connected to '${channel.name}'`);
};
