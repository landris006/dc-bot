import { CacheType, GuildMember, Interaction } from 'discord.js';
import { logger } from '../utils/logger';

export const interactionRouer = async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandName = interaction.commandName as Commands;

  const commandHandler = await import(
    `../handlers/interactions/${commandName}`
  );

  if (typeof commandHandler !== 'function') {
    setTimeout(() => {
      interaction.deleteReply();
    }, 10000);

    return interaction.reply(
      'There was an error while executing this command!',
    );
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

type Commands =
  | 'ping'
  | 'banish'
  | 'level'
  | 'turtles'
  | 'minecraft'
  | 'current'
  | 'leave';
