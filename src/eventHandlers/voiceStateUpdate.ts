import { VoiceState } from 'discord.js';
import { prisma } from '../index';
import { upsertMember } from '../utils/upsertMember';

export interface Connection {
  startTime: number;
  guildID: string;
}

export namespace voiceStateUpdateHandlers {
  export const handleConnection = async (
    connections: Map<string, Connection>,
    newState: VoiceState
  ) => {
    const member = newState.member;
    if (!member) {
      return;
    }

    const userID = member.id;
    const guildID = newState.guild.id;
    const channel = newState.channel;
    if (!channel) {
      return;
    }

    await prisma.voiceChannel.upsert({
      where: { id: channel.id },
      update: { connections: { increment: 1 } },
      create: { id: channel.id, name: channel.name, guildID, connections: 1 },
    });

    connections.set(userID, {
      startTime: Date.now(),
      guildID,
    });

    const username = member.user.username;
    await upsertMember({
      userID,
      username,
      guildID,
      nickname: member.nickname,
      joinedAt: member.joinedAt,
    });
  };

  export const handleDisconnection = async (
    connections: Map<string, Connection>,
    newState: VoiceState
  ) => {
    const member = newState.member;
    if (!member) {
      return;
    }
    const userID = member.id;
    const guildID = newState.guild.id;

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

    const updatedMember = await prisma.guildMember.update({
      where: { guildID_userID: { guildID, userID: userID } },
      data: {
        hoursActive: {
          increment: hoursSpent,
        },
      },
    });
  };

  export const handleChannelChange = async (newState: VoiceState) => {
    const guildID = newState.guild.id;
    const channel = newState.channel;
    if (!channel) {
      return;
    }

    await prisma.voiceChannel.upsert({
      where: { id: channel.id },
      update: { connections: { increment: 1 } },
      create: { id: channel.id, name: channel.name, guildID, connections: 1 },
    });
  };
}
