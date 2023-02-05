import { CommandInteraction } from 'discord.js';
import { client } from '../..';

export const leave = async (interaction: CommandInteraction) => {
  if (!client.state.currentConnection) {
    return interaction.reply('Not connected to any voice channel!');
  }

  client.state.currentConnection.disconnect();

  interaction.reply('Left voice channel!');
};
