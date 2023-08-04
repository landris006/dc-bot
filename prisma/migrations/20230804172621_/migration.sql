-- AlterTable
ALTER TABLE "connection" RENAME CONSTRAINT "Connection_pkey" TO "connection_pkey";

-- AlterTable
ALTER TABLE "guild" RENAME CONSTRAINT "Guild_pkey" TO "guild_pkey";

-- AlterTable
ALTER TABLE "guild_member" RENAME CONSTRAINT "GuildMember_pkey" TO "guild_member_pkey";

-- AlterTable
ALTER TABLE "message" RENAME CONSTRAINT "Message_pkey" TO "message_pkey";

-- AlterTable
ALTER TABLE "text_channel" RENAME CONSTRAINT "TextChannel_pkey" TO "text_channel_pkey";

-- AlterTable
ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";

-- AlterTable
ALTER TABLE "voice_channel" RENAME CONSTRAINT "VoiceChannel_pkey" TO "voice_channel_pkey";
