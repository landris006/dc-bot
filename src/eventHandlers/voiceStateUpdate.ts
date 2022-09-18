import { VoiceState } from 'discord.js';
import { prisma } from '../index';

export interface Connection {
  startTime: number;
  memberID: string;
  guildID: string;
}

export const voiceStateUpdateHandler = async (
  oldState: VoiceState,
  newState: VoiceState,
  connections: Connection[]
): Promise<Connection[]> => {
  if (!newState.member) {
    return connections;
  }

  const newConnections = [...connections];
  const member = newState.member;
  const id = member.id;
  const guildID = newState.guild.id;

  // Connection
  if (!oldState.channelId) {
    newConnections.push({
      startTime: Date.now(),
      memberID: id,
      guildID,
    });

    const username = member.user.username;
    await prisma.user.upsert({
      where: { id },
      update: { username },
      create: { id, username },
    });

    await prisma.guildMember.upsert({
      where: { guildID_userID: { guildID, userID: id } },
      update: { nickname: member.nickname },
      create: {
        guildID,
        userID: id,
        joinedAt: member.joinedAt ?? Date(),
        nickname: member.nickname,
      },
    });

    return newConnections;
  }

  // Disconnection
  if (!newState.channelId) {
    return newConnections.filter(async (connection) => {
      if (connection.memberID !== newState.member?.id) {
        return true;
      }

      const MILISECONDS_TO_HOURS = 2.77777778e-7;
      const hoursSpent =
        (Date.now() - connection.startTime) * MILISECONDS_TO_HOURS;

      await prisma.guildMember.update({
        where: { guildID_userID: { guildID, userID: id } },
        data: {
          hoursActive: {
            increment: hoursSpent,
          },
        },
      });

      console.log(
        `${newState.member.nickname} left after: ${
          hoursSpent / MILISECONDS_TO_HOURS / 1000
        } seconds`
      );

      return false;
    });
  }

  return connections;
};
