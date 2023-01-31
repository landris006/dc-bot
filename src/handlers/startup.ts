import { ActivityType } from 'discord.js';
import { client, prisma } from '../index';
import { logger } from '../utils/logger';
import { upsertMember } from '../utils/upsertMember';

export const startup = async () => {
  client.user?.setActivity({
    name: 'with your mom',
    type: ActivityType.Playing,
  });
  logger(`Logged in as ${client.user?.tag}!`);

  if (process.env.ENVIRONMENT === 'dev') {
    logger('Dev mode enabled, skipping database sync');
    return;
  }

  Promise.all(
    client.guilds.cache.map(async (guild) => {
      const iconURL = guild.iconURL();
      await prisma.guild.upsert({
        where: { id: guild.id },
        update: { name: guild.name, iconURL },
        create: {
          id: guild.id,
          name: guild.name,
          iconURL,
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
            guildID: guild.id,
            userID: member.user.id,
            username: member.user.username,
            nickname: member.nickname,
            avatarURL: member.user.avatarURL(),
            joinedAt: member.joinedAt,
          });
        }),
      );

      await prisma.connection.deleteMany({
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
                guildID: guild.id,
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
                guildID: guild.id,
              },
            });
          }
        }),
      );
    }),
  );
};
