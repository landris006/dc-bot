-- DropForeignKey
ALTER TABLE "connection" DROP CONSTRAINT "connection_guildMemberID_fkey";

-- DropForeignKey
ALTER TABLE "connection" DROP CONSTRAINT "connection_voiceChannelID_fkey";

-- DropForeignKey
ALTER TABLE "guild_member" DROP CONSTRAINT "guild_member_guildID_fkey";

-- DropForeignKey
ALTER TABLE "guild_member" DROP CONSTRAINT "guild_member_userID_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_guildMemberID_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_textChannelID_fkey";

-- DropForeignKey
ALTER TABLE "text_channel" DROP CONSTRAINT "text_channel_guildID_fkey";

-- DropForeignKey
ALTER TABLE "voice_channel" DROP CONSTRAINT "voice_channel_guildID_fkey";

-- DropIndex
DROP INDEX "GuildMember_guildID_userID_key";

-- DropIndex
DROP INDEX "guild_member_guildID_userID_key";

-- AlterTable
ALTER TABLE "connection" RENAME COLUMN "endTime" TO "end_time";
ALTER TABLE "connection" RENAME COLUMN "guildMemberID" TO "guild_member_id";
ALTER TABLE "connection" RENAME COLUMN "startTime" TO "start_time";
ALTER TABLE "connection" RENAME COLUMN "voiceChannelID" TO "voice_channel_id";

-- AlterTable
ALTER TABLE "guild" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "guild" RENAME COLUMN "iconURL" TO "icon_url";

-- AlterTable
ALTER TABLE "guild_member" RENAME COLUMN "guildID" TO "guild_id";
ALTER TABLE "guild_member" RENAME COLUMN "joinedAt" TO "joined_at";
ALTER TABLE "guild_member" RENAME COLUMN "userID" TO "user_id";

-- AlterTable
ALTER TABLE "message" RENAME COLUMN "guildMemberID" TO "guild_member_id";
ALTER TABLE "message" RENAME COLUMN "sentAt" TO "sent_at";
ALTER TABLE "message" RENAME COLUMN "textChannelID" TO "text_channel_id";

-- AlterTable
ALTER TABLE "text_channel" RENAME COLUMN "guildID" TO "guild_id";

-- AlterTable
ALTER TABLE "user" RENAME COLUMN "avatarURL" TO "avatar_url";

-- AlterTable
ALTER TABLE "voice_channel" RENAME COLUMN "guildID" TO "guild_id";

-- CreateIndex
CREATE UNIQUE INDEX "guild_member_guild_id_user_id_key" ON "guild_member"("guild_id", "user_id");

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_channel" ADD CONSTRAINT "voice_channel_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_voice_channel_id_fkey" FOREIGN KEY ("voice_channel_id") REFERENCES "voice_channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_guild_member_id_fkey" FOREIGN KEY ("guild_member_id") REFERENCES "guild_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_channel" ADD CONSTRAINT "text_channel_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_text_channel_id_fkey" FOREIGN KEY ("text_channel_id") REFERENCES "text_channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_guild_member_id_fkey" FOREIGN KEY ("guild_member_id") REFERENCES "guild_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
