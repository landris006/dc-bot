import { CommandInteraction } from 'discord.js';
import { prisma } from '../..';
import { Conversions } from '../../utils/conversions';

export const level = async (interaction: CommandInteraction) => {
  const guildId = interaction.guild?.id as string;
  const userId = interaction.user.id;

  const member = await prisma.guildMember.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (!member) {
    return interaction.reply('Something went wrong, please try again later.');
  }

  const connections = await prisma.connection.findMany({
    where: {
      guildMemberId: member.id,
    },
  });

  const hoursActive = connections.reduce((acc, connection) => {
    if (connection.endTime) {
      return (
        acc +
        (connection.endTime.getTime() - connection.startTime.getTime()) *
          Conversions.MILISECONDS_TO_HOURS
      );
    }

    return acc;
  }, 0);

  const currentLevel = Conversions.HOURS_TO_LEVEL(hoursActive);
  return interaction.reply(
    `You have been active for ${
      Math.round(hoursActive * 100) / 100 // round to 2 decimal places
    } hours, you will reach level ${currentLevel + 1} (${Conversions.LEVEL_TO_HOURS(
      currentLevel + 1,
    )} hours) in ${
      Math.round((Conversions.LEVEL_TO_HOURS(currentLevel + 1) - hoursActive) * 100) / 100
    } hours.`,
  );
};
