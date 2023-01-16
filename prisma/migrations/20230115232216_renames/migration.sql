/*
  Warnings:

  - You are about to drop the column `messageChannelID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `MessageChannel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `textChannelID` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_messageChannelID_fkey";

-- DropForeignKey
ALTER TABLE "MessageChannel" DROP CONSTRAINT "MessageChannel_guildID_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageChannelID",
ADD COLUMN     "textChannelID" TEXT NOT NULL;

-- DropTable
DROP TABLE "MessageChannel";

-- CreateTable
CREATE TABLE "TextChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,

    CONSTRAINT "TextChannel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TextChannel" ADD CONSTRAINT "TextChannel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_textChannelID_fkey" FOREIGN KEY ("textChannelID") REFERENCES "TextChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
