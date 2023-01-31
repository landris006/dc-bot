import { client, prisma } from '../../index';
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

  const hoursSpent =
    (connection.endTime!.getTime() - connection.startTime.getTime()) *
    Conversions.MILISECONDS_TO_HOURS;

  await logger(
    `${oldState.member?.nickname} left '${oldChannelName}' after: ${
      (hoursSpent / Conversions.MILISECONDS_TO_HOURS) *
      Conversions.MILISECONDS_TO_SECONDS
    } seconds`,
  );

  const level = Conversions.HOURS_TO_LEVEL(hoursSpent);

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
