import { CacheType, GuildMember, Interaction } from 'discord.js';
import { logger } from '../utils/logger';
import { ping } from '../handlers/interactionHandlers.ts/ping';
import { banish } from '../handlers/interactionHandlers.ts/banish';
import { leave } from '../handlers/interactionHandlers.ts/leave';
import { level } from '../handlers/interactionHandlers.ts/level';
import { minecraft } from '../handlers/interactionHandlers.ts/minecraft';
import { turtles } from '../handlers/interactionHandlers.ts/turtles';

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
    | 'leave';

  await logger(
    `${
      (interaction.member as GuildMember).nickname
    } used the '/${commandName}' command!`
  );

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

    default:
      break;
  }

  setTimeout(() => {
    interaction.deleteReply();
  }, 10000);
};
