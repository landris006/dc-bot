-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarURL" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iconURL" TEXT,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "nickname" TEXT,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,

    CONSTRAINT "VoiceChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "guildMemberID" TEXT NOT NULL,
    "voiceChannelID" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,

    CONSTRAINT "MessageChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "messageChannelID" TEXT NOT NULL,
    "guildMemberID" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildID_userID_key" ON "GuildMember"("guildID", "userID");

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceChannel" ADD CONSTRAINT "VoiceChannel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_voiceChannelID_fkey" FOREIGN KEY ("voiceChannelID") REFERENCES "VoiceChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_guildMemberID_fkey" FOREIGN KEY ("guildMemberID") REFERENCES "GuildMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChannel" ADD CONSTRAINT "MessageChannel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_messageChannelID_fkey" FOREIGN KEY ("messageChannelID") REFERENCES "MessageChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_guildMemberID_fkey" FOREIGN KEY ("guildMemberID") REFERENCES "GuildMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
