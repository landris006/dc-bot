import { Presence } from 'discord.js';
import { prisma } from '..';
import { logger } from '../utils/logger';

export async function onPresenceUpdate(newPresence: Presence) {
  const user = newPresence.user;

  if (!user) {
    return;
  }

  const nickname = newPresence.member?.nickname ?? user?.username;

  const activitiesInProgress = await prisma.activity.findMany({
    where: {
      userId: user.id,
      endTime: null,
    },
  });

  const counter = activitiesInProgress.reduce<Record<string, number>>((acc, activity) => {
    if (!acc[activity.name]) {
      acc[activity.name] = 1;
      return acc;
    }
    acc[activity.name] += 1;
    return acc;
  }, {});

  const duplicateActivityNames = Object.entries(counter)
    .filter(([_name, count]) => count > 1)
    .map(([name]) => name);
  if (duplicateActivityNames.length > 0) {
    await Promise.all(
      duplicateActivityNames.map(async (activityName) => {
        return prisma.activity.deleteMany({
          where: {
            userId: user.id,
            name: activityName,
            endTime: null,
          },
        });
      }),
    );

    return;
  }

  await Promise.all(
    activitiesInProgress.map(async (activity) => {
      const stillActive = !!newPresence.activities.find(
        (newActivity) => newActivity.name === activity.name,
      );

      if (!stillActive) {
        await logger(
          `${nickname} stopped ${typeMap[activity.type as keyof typeof typeMap]} ${activity.name}`,
        );
        return prisma.activity.update({
          where: {
            id: activity.id,
          },
          data: {
            endTime: new Date(),
          },
        });
      }
    }),
  );

  await Promise.all(
    newPresence.activities.map(async (newActivityData) => {
      const alreadyInProgress = !!activitiesInProgress.find(
        (activity) => activity.name === newActivityData.name,
      );
      if (alreadyInProgress) {
        return;
      }

      const { applicationId, assets } = newActivityData;
      const imageId = assets?.largeImage ?? assets?.smallImage;

      let iconUrl = null;
      if (applicationId && imageId) {
        iconUrl = `https://cdn.discordapp.com/app-assets/${applicationId}/${imageId}.png`;
      }

      await logger(
        `${nickname} started ${typeMap[newActivityData.type as keyof typeof typeMap]} ${
          newActivityData.name
        }`,
      );
      return prisma.activity.create({
        data: {
          name: newActivityData.name,
          type: newActivityData.type,
          userId: user.id,
          iconUrl,
        },
      });
    }),
  );
}

const typeMap = {
  0: 'playing',
  1: 'streaming',
  2: 'listening to',
  3: 'watching',
  4: 'custom',
  5: 'competing in',
};
