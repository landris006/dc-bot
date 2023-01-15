import { client, prisma } from '../../index';
import { VoiceState } from 'discord.js';
import { logger } from '../../utils/logger';
import { upsertMember } from '../../utils/upsertMember';

export const connection = async (newState: VoiceState) => {
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

  client.state.connections.set(userID, {
    startTime: Date.now(),
    guildID,
  });

  await upsertMember({
    userID,
    username: member.user.username,
    guildID,
    nickname: member.nickname,
    avatarURL: member.user.avatarURL(),
    joinedAt: member.joinedAt,
  });

  logger(`${member.nickname} connected to '${channel.name}'`);
};
