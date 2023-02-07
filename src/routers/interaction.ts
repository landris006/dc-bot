import { CacheType, GuildMember, Interaction } from 'discord.js';
import { logger } from '../utils/logger';

export const interactionRouter = async (
  interaction: Interaction<CacheType>,
) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandName = interaction.commandName;

  const commandHandler = (
    await import(`../handlers/interactions/${commandName}`)
  )[commandName];

  if (typeof commandHandler !== 'function') {
    setTimeout(() => {
      interaction.deleteReply();
    }, 10000);

    await interaction.reply('There was an error while executing this command!');
    return;
  }

  await commandHandler(interaction);

  await logger(
    `${
      (interaction.member as GuildMember).nickname
    } used the '/${commandName}' command!`,
  );

  setTimeout(() => {
    interaction.deleteReply();
  }, 10000);
};
