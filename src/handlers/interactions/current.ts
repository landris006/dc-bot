import { prisma } from '../..';
import { CommandInteraction } from 'discord.js';
import { Connection } from '@prisma/client';
import { Conversions } from '../../utils/conversions';

export const current = async (interaction: CommandInteraction) => {
  const channels = (await interaction.guild?.channels.fetch())?.filter(
    (channel) => channel?.isVoiceBased(),
  );

  if (!channels?.size) {
    return interaction.reply('This guild has no voice channels!');
  }

  let ongoingConnections = (
    await Promise.all(
      channels.map((channel) => {
        if (!channel) {
          return [] as Connection[];
        }

        return prisma.connection.findMany({
          where: {
            voiceChannelId: channel.id,
            endTime: null,
          },
        });
      }),
    )
  ).flat();

  if (!ongoingConnections.length) {
    return interaction.reply('There are no ongoing connections!');
  }

  const reply = await Promise.all(
    ongoingConnections.map(async (connection) => {
      const member = await prisma.guildMember.findUnique({
        where: {
          id: connection.guildMemberId,
        },
        include: {
          user: true,
        },
      });

      if (!member) {
        return '';
      }

      const connectionTime = new Date().getTime() - connection.startTime.getTime();

      return `${member.nickname ?? member.user.username} has been connected for ${
        connectionTime * Conversions.MILISECONDS_TO_SECONDS
      } seconds.`;
    }),
  );

  return interaction.reply(reply.join('\n'));
};
