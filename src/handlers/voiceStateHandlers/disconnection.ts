import { client, prisma } from '../../index';
import { VoiceState } from 'discord.js';
import { Conversions } from '../../utils/conversions';
import { logger } from '../../utils/logger';

export const disconnection = async (
  newState: VoiceState,
  oldChannelName: string
) => {
  const member = newState.member;
  if (!member) {
    return;
  }
  const userID = member.id;
  const guildID = newState.guild.id;

  const connection = client.state.connections.get(userID);
  if (!connection) {
    return;
  }
  client.state.connections.delete(userID);

  const hoursSpent =
    (Date.now() - connection.startTime) * Conversions.MILISECONDS_TO_HOURS;

  await logger(
    `${newState.member?.nickname} left '${oldChannelName}' after: ${
      (hoursSpent / Conversions.MILISECONDS_TO_HOURS) *
      Conversions.MILISECONDS_TO_SECONDS
    } seconds`
  );

  const updatedMember = await prisma.guildMember.update({
    where: { guildID_userID: { guildID, userID } },
    data: {
      hoursActive: {
        increment: hoursSpent,
      },
    },
  });

  const level = Conversions.HOURS_TO_LEVEL(updatedMember.hoursActive);

  let roleForLevel = newState.guild.roles.cache.find(
    (role) => role.name === `Level ${level}`
  );

  if (!roleForLevel) {
    roleForLevel = await newState.guild.roles.create({
      name: `Level ${level}`,
      color: Conversions.LEVEL_TO_COLOR_MAP.get(level % 10),
    });
  }

  await Promise.all(
    member.roles.cache
      .filter((role) => role.name.startsWith('Level'))
      .map((role) => member.roles.remove(role))
  );

  await member.roles.add(roleForLevel);
};
