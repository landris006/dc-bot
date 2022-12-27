import { prisma } from '../index';

export const upsertMember = async (
  data: {
    userID: string;
    username: string;
    guildID: string;
    nickname: string | null;
    avatarURL: string | null;
    joinedAt: Date | null;
  },
  customMemberUpdate?: object
) => {
  const { userID, username, guildID, nickname, avatarURL, joinedAt } = data;
  await prisma.user.upsert({
    where: { id: userID },
    update: { username },
    create: { id: userID, username },
  });

  await prisma.guildMember.upsert({
    where: { guildID_userID: { guildID, userID: userID } },
    update: {
      nickname: nickname ?? username,
      avatarURL,
      ...customMemberUpdate,
    },
    create: {
      guildID,
      userID,
      joinedAt: joinedAt ?? Date(),
      nickname: nickname ?? username,
      avatarURL,
    },
  });
};
