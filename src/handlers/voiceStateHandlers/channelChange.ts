import { prisma } from '../../index';
import { VoiceState } from 'discord.js';
import { logger } from '../../utils/logger';

export const channelChange = async (
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
