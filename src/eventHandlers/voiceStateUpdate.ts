import { SelectMenuOptionBuilder, VoiceState } from 'discord.js';
import { prisma, State } from '../index';
import { upsertMember } from '../utils/upsertMember';
import { Conversions } from '../utils/conversions';
import { logger } from '../utils/logger';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} from '@discordjs/voice';

export interface Connection {
  startTime: number;
  guildID: string;
}

export namespace VoiceStateUpdateHandlers {
  export const handleMinecraft = (
    oldState: VoiceState,
    newState: VoiceState,
    state: State
  ) => {
    const connection = getVoiceConnection(newState.guild.id, 'client');

    if (!state.currentConnection || !connection) {
      return;
    }

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    const resource = createAudioResource(
      `${process.cwd()}/assets/sound/get-out-of-my-room-im-playing-minecraft.mp3`
    );

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();

      newState.channel?.members.map((member) => {
        if (member.user.bot) {
          return;
        }

        if (!oldState) {
          return member.voice.disconnect();
        }

        return member.voice.setChannel(oldState.channelId);
      });
    });
  };

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

    logger(`${member.nickname} connected to '${channel.name}'`);
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
