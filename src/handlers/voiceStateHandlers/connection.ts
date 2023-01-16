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

  await prisma.connection.create({
    data: {
      guildMemberID: guildMember.id,
      voiceChannelID: channel.id,
    },
  });

  logger(`${member.nickname} connected to '${channel.name}'`);
};
