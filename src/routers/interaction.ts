import { CacheType, GuildMember, Interaction } from 'discord.js';
import { logger } from '../utils/logger';
import { ping } from '../handlers/interactions/ping';
import { banish } from '../handlers/interactions/banish';
import { leave } from '../handlers/interactions/leave';
import { level } from '../handlers/interactions/level';
import { minecraft } from '../handlers/interactions/minecraft';
import { turtles } from '../handlers/interactions/turtles';
import { current } from '../handlers/interactions/current';

export const interactionRouer = async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const commandName = interaction.commandName as Commands;

  type Commands =
    | 'ping'
    | 'banish'
    | 'level'
    | 'turtles'
    | 'minecraft'
    | 'current'
    | 'leave';

  await logger(
    `${
      (interaction.member as GuildMember).nickname
    } used the '/${commandName}' command!`,
  );

  // TODO: dynamically import commands
  switch (commandName) {
    case 'ping':
      await ping(interaction);
      break;
    case 'banish':
      await banish(interaction);
      break;
    case 'level':
      await level(interaction);
      break;
    case 'turtles':
      await turtles(interaction);
      break;
    case 'minecraft':
      await minecraft(interaction);
      break;
    case 'leave':
      await leave(interaction);
      break;
    case 'current':
      await current(interaction);
      break;

    default:
      break;
  }

  setTimeout(() => {
    interaction.deleteReply();
  }, 10000);
};
