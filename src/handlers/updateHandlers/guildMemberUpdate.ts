import { GuildMember } from 'discord.js';
import { upsertMember } from '../../utils/upsertMember';

export const guildMemberUpdate = async (member: GuildMember) => {
  if (member.user.bot) {
    return;
  }

  return upsertMember({
    guildID: member.guild.id,
    userID: member.user.id,
    username: member.user.username,
    nickname: member.nickname,
    avatarURL: member.user.avatarURL(),
    joinedAt: member.joinedAt,
  });
};
