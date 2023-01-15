import { ActivityType } from 'discord.js';
import { client, prisma } from '../index';
import { logger } from '../utils/logger';
import { upsertMember } from '../utils/upsertMember';

export const startup = async () => {
  client.user?.setActivity({
    name: 'with your mom',
    type: ActivityType.Playing,
  });

  Promise.all(
    client.guilds.cache.map(async (guild) => {
      const iconURL = guild.iconURL();

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
        })
      );

      return prisma.guild.upsert({
        where: { id: guild.id },
        update: { name: guild.name, iconURL },
        create: {
          id: guild.id,
          name: guild.name,
          iconURL,
          createdAt: guild.createdAt,
        },
      });
    })
  );

  logger(`Logged in as ${client.user?.tag}!`);
};
