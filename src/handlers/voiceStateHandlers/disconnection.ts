import { prisma } from '../../index';
import { VoiceState } from 'discord.js';
import { Conversions } from '../../utils/conversions';
import { logger } from '../../utils/logger';

export const disconnection = async (
  oldState: VoiceState,
  oldChannelName: string,
) => {
  const member = oldState.member;
  const channel = oldState.channel;
  if (!member || !channel) {
    return;
  }

  const guildMember = await prisma.guildMember.findFirst({
    where: { guildID: oldState.guild.id, userID: member.user.id },
  });
  if (!guildMember) {
    return;
  }

  const openConnections = await prisma.connection.findMany({
    where: {
      guildMemberID: guildMember.id,
      voiceChannelID: channel.id,
      endTime: null,
    },
  });

  if (!openConnections.length) {
    return;
  }

  if (openConnections.length > 1) {
    return prisma.connection.deleteMany({
      where: {
        guildMemberID: guildMember.id,
        voiceChannelID: channel.id,
        endTime: null,
      },
    });
  }

  const connection = await prisma.connection.update({
    where: {
      id: openConnections[0].id,
    },
    data: {
      endTime: new Date(),
    },
  });

  const timeSpent =
    connection.endTime!.getTime() - connection.startTime.getTime();

  await logger(
    `${oldState.member?.nickname} left '${oldChannelName}' after: ${
      timeSpent * Conversions.MILISECONDS_TO_SECONDS
    } seconds`,
  );

  const connections = await prisma.connection.findMany({
    where: {
      guildMemberID: guildMember.id,
    },
  });

  const totalTimeSpent = connections.reduce((total, connection) => {
    const { startTime, endTime } = connection;
    if (!endTime) {
      return total;
    }

    return total + (endTime.getTime() - startTime.getTime());
  }, 0);

  const level = Conversions.HOURS_TO_LEVEL(
    totalTimeSpent * Conversions.MILISECONDS_TO_HOURS,
  );

  let roleForLevel = oldState.guild.roles.cache.find(
    (role) => role.name === `Level ${level}`,
  );

  if (!roleForLevel) {
    roleForLevel = await oldState.guild.roles.create({
      name: `Level ${level}`,
      color: Conversions.LEVEL_TO_COLOR_MAP.get(level % 10),
    });
  }

  await Promise.all(
    member.roles.cache
      .filter((role) => role.name.startsWith('Level'))
      .map((role) => member.roles.remove(role)),
  );
  await member.roles.add(roleForLevel);
};
