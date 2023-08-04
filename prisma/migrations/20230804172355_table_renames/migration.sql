-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_guildMemberID_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_voiceChannelID_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_guildID_fkey";

-- DropForeignKey
ALTER TABLE "GuildMember" DROP CONSTRAINT "GuildMember_userID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_guildMemberID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_textChannelID_fkey";

-- DropForeignKey
ALTER TABLE "TextChannel" DROP CONSTRAINT "TextChannel_guildID_fkey";

-- DropForeignKey
ALTER TABLE "VoiceChannel" DROP CONSTRAINT "VoiceChannel_guildID_fkey";

-- DropTable
ALTER TABLE "Connection" RENAME TO "connection";

-- DropTable
ALTER TABLE "Guild" RENAME TO "guild";

-- DropTable
ALTER TABLE "GuildMember" RENAME TO "guild_member";

-- DropTable
ALTER TABLE "Message" RENAME TO "message";

-- DropTable
ALTER TABLE "TextChannel" RENAME TO "text_channel";

-- DropTable
ALTER TABLE "User" RENAME TO "user";

-- DropTable
ALTER TABLE "VoiceChannel" RENAME TO "voice_channel";


-- CreateIndex
CREATE UNIQUE INDEX "guild_member_guildID_userID_key" ON "guild_member"("guildID", "userID");

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_userID_fkey" FOREIGN KEY ("userID") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_member" ADD CONSTRAINT "guild_member_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_channel" ADD CONSTRAINT "voice_channel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_voiceChannelID_fkey" FOREIGN KEY ("voiceChannelID") REFERENCES "voice_channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connection" ADD CONSTRAINT "connection_guildMemberID_fkey" FOREIGN KEY ("guildMemberID") REFERENCES "guild_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_channel" ADD CONSTRAINT "text_channel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_textChannelID_fkey" FOREIGN KEY ("textChannelID") REFERENCES "text_channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_guildMemberID_fkey" FOREIGN KEY ("guildMemberID") REFERENCES "guild_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
