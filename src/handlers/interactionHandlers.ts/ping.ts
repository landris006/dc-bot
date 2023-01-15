import { CommandInteraction } from 'discord.js';

export const ping = async (interaction: CommandInteraction) => {
  return interaction.reply('Pong!');
};
