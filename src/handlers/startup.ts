import { ActivityType } from 'discord.js';
import { client, prisma } from '../index';
import { logger } from '../utils/logger';
import { upsertMember } from '../utils/upsertMember';

export const startup = async () => {
  client.user?.setActivity({
    name: process.env.ENVIRONMENT === 'dev' ? 'testing' : 'with your mom',
    type: ActivityType.Playing,
  });
  logger(`Logged in as ${client.user?.tag}!`);

  Promise.all(
    client.guilds.cache.map(async (guild) => {
      const iconUrl = guild.iconURL();
      await prisma.guild.upsert({
        where: { id: guild.id },
        update: { name: guild.name, iconUrl },
        create: {
          id: guild.id,
          name: guild.name,
          iconUrl,
          createdAt: guild.createdAt,
        },
      });

      const members = await guild.members.fetch();
      await Promise.all(
        members.map((member) => {
          if (member.user.bot) {
            return;
          }

          return upsertMember({
            guildId: guild.id,
            userId: member.user.id,
            username: member.user.username,
            nickname: member.nickname,
            avatarUrl: member.user.avatarURL(),
            joinedAt: member.joinedAt,
          });
        }),
      );

      await prisma.connection.deleteMany({
        where: {
          endTime: null,
        },
      });

      await prisma.activity.deleteMany({
        where: {
          endTime: null,
        },
      });

      const voiceChannels = await guild.channels.fetch();
      return Promise.all(
        voiceChannels.map(async (channel) => {
          if (!channel) {
            return;
          }

          if (channel.isVoiceBased()) {
            return prisma.voiceChannel.upsert({
              where: { id: channel.id },
              update: { name: channel.name },
              create: {
                id: channel.id,
                name: channel.name,
                guildId: guild.id,
              },
            });
          }

          if (channel.isTextBased()) {
            return prisma.textChannel.upsert({
              where: { id: channel.id },
              update: { name: channel.name },
              create: {
                id: channel.id,
                name: channel.name,
                guildId: guild.id,
              },
            });
          }
        }),
      );
    }),
  );
};
