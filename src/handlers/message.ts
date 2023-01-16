import { Message } from 'discord.js';
import fs from 'fs';
import { prisma } from '..';

export const messageHandler = async (message: Message) => {
  if (message.member?.user.bot) {
    return;
  }

  const guildMember = await prisma.guildMember.findFirst({
    where: {
      guildID: message.guild?.id,
      userID: message.member?.user.id,
    },
  });

  if (guildMember) {
    await prisma.message.create({
      data: {
        textChannelID: message.channel.id,
        guildMemberID: guildMember.id,
      },
    });
  }

  if (message.content.includes('yorokobe shounen')) {
    fs.readdir('./assets/kirei/', (err, files) => {
      if (err) {
        return;
      }

      message.channel.send({
        files: [
          `./assets/kirei/${files[Math.floor(Math.random() * files.length)]}`,
        ],
      });
    });
  }
};
