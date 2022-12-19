import { Message } from 'discord.js';
import { upsertMember } from '../utils/upsertMember';
import fs from 'fs';

export namespace MessageHandlers {
  export const messageHandler = async (message: Message) => {
    const guildID = message.guild?.id;
    const member = message.member;

    if (!member || !guildID) {
      return;
    }

    const username = member.user.username;
    const userID = member.id;

    await upsertMember(
      {
        userID,
        username,
        guildID,
        nickname: member.nickname,
        joinedAt: member.joinedAt,
      },
      {
        messagesSent: {
          increment: 1,
        },
      }
    );

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
}
