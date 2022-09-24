import { CommandInteraction } from 'discord.js';

export namespace slashCommandInteractionHandlers {
  export const ping = (interaction: CommandInteraction) => {
    return interaction.reply('Pong!');
  };
}
