import { prisma } from '../index';

export const upsertMember = async (
  data: {
    userId: string;
    username: string;
    guildId: string;
    nickname: string | null;
    avatarUrl: string | null;
    joinedAt: Date | null;
  },
  customMemberUpdate?: object,
) => {
  const { userId, username, guildId, nickname, avatarUrl, joinedAt } = data;
  await prisma.user.upsert({
    where: { id: userId },
    update: { username, avatarUrl },
    create: { id: userId, username, avatarUrl },
  });

  await prisma.guildMember.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: {
      nickname: nickname ?? username,
      ...customMemberUpdate,
    },
    create: {
      guildId,
      userId,
      joinedAt: joinedAt ?? Date(),
      nickname: nickname ?? username,
    },
  });
};
