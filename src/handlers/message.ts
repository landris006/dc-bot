import { Message } from 'discord.js';
import fs from 'fs';

export const messageHandler = async (message: Message) => {
  if (message.member?.user.bot) {
    return;
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
