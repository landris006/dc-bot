import { CommandInteraction } from 'discord.js';
import { prisma } from '../..';
import { Conversions } from '../../utils/conversions';

export const level = async (interaction: CommandInteraction) => {
  const guildID = interaction.guild?.id as string;
  const userID = interaction.user.id;

  const member = await prisma.guildMember.findUnique({
    where: { guildID_userID: { guildID, userID } },
  });

  if (!member) {
    return interaction.reply(
      'You have no level! Join a channel to start leveling up!'
    );
  }

  const currentLevel = Conversions.HOURS_TO_LEVEL(member.hoursActive);
  return interaction.reply(
    `You have been active for ${
      Math.round(member.hoursActive * 100) / 100 // round to 2 decimal places workaround
    } hours, you will reach level ${
      currentLevel + 1
    } (${Conversions.LEVEL_TO_HOURS(currentLevel + 1)} hours) in ${
      Math.round(
        (Conversions.LEVEL_TO_HOURS(currentLevel + 1) - member.hoursActive) *
          100
      ) / 100
    } hours.`
  );
};
