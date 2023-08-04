import { GuildMember } from 'discord.js';
import { upsertMember } from '../../utils/upsertMember';

export const guildMemberUpdate = async (member: GuildMember) => {
  if (member.user.bot) {
    return;
  }

  return upsertMember({
    guildId: member.guild.id,
    userId: member.user.id,
    username: member.user.username,
    nickname: member.nickname,
    avatarUrl: member.user.avatarURL(),
    joinedAt: member.joinedAt,
  });
};
