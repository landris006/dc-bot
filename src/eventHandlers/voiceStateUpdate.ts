import { VoiceState } from 'discord.js';
import { prisma } from '../index';

export interface Connection {
  startTime: number;
  guildID: string;
}

export const voiceStateUpdateHandler = async (
  oldState: VoiceState,
  newState: VoiceState,
  connections: Map<string, Connection>
): Promise<void> => {
  if (!newState.member) {
    return;
  }

  const member = newState.member;
  const userID = member.id;
  const guildID = newState.guild.id;

  // Connection
  if (!oldState.channelId) {
    connections.set(userID, {
      startTime: Date.now(),
      guildID,
    });

    const username = member.user.username;
    await prisma.user.upsert({
      where: { id: userID },
      update: { username },
      create: { id: userID, username },
    });

    await prisma.guildMember.upsert({
      where: { guildID_userID: { guildID, userID: userID } },
      update: { nickname: member.nickname },
      create: {
        guildID,
        userID,
        joinedAt: member.joinedAt ?? Date(),
        nickname: member.nickname,
      },
    });

    return;
  }

  // Disconnection
  if (!newState.channelId) {
    const connection = connections.get(userID);
    if (!connection) {
      return;
    }
    connections.delete(userID);

    const MILISECONDS_TO_HOURS = 2.77777778e-7;
    const MILISECONDS_TO_SECONDS = 1e-3;

    const hoursSpent =
      (Date.now() - connection.startTime) * MILISECONDS_TO_HOURS;

    console.log(
      `${newState.member?.nickname} left after: ${
        (hoursSpent / MILISECONDS_TO_HOURS) * MILISECONDS_TO_SECONDS
      } seconds`
    );

    await prisma.guildMember.update({
      where: { guildID_userID: { guildID, userID: userID } },
      data: {
        hoursActive: {
          increment: hoursSpent,
        },
      },
    });
  }
};
