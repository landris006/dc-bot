import { VoiceState } from 'discord.js';
import { prisma } from '../index';
import { upsertMember } from '../utils/upsertMember';
import { Constants } from '../utils/constants';
import { logger } from '../utils/logger';

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

    await upsertMember({
      userID,
      username: member.user.username,
      guildID,
      nickname: member.nickname,
      joinedAt: member.joinedAt,
    });

    logger(`${member.nickname} connected to ${channel.name}`);
  };

  export const handleDisconnection = async (
    connections: Map<string, Connection>,
    newState: VoiceState,
    oldChannelName: string
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

    const hoursSpent =
      (Date.now() - connection.startTime) * Constants.MILISECONDS_TO_HOURS;

    logger(
      `${newState.member?.nickname} left '${oldChannelName}' after: ${
        (hoursSpent / Constants.MILISECONDS_TO_HOURS) *
        Constants.MILISECONDS_TO_SECONDS
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

    const level = Constants.HOURS_TO_LEVEL(updatedMember.hoursActive);

    let roleForLevel = newState.guild.roles.cache.find(
      (role) => role.name === `Level ${level}`
    );

    if (!roleForLevel) {
      roleForLevel = await newState.guild.roles.create({
        name: `Level ${level}`,
        color: Constants.LEVEL_TO_COLOR_MAP.get(level % 10),
      });
    }

    await Promise.all(
      member.roles.cache
        .filter((role) => role.name.startsWith('Level'))
        .map((role) => member.roles.remove(role))
    );

    await member.roles.add(roleForLevel);
  };

  export const handleChannelChange = async (
    newState: VoiceState,
    oldChannelName: string
  ) => {
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

    logger(
      `${newState.member?.nickname} moved from '${oldChannelName}' to '${channel.name}'`
    );
  };
}
