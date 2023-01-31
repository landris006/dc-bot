import {
  REST,
  SlashCommandBuilder,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import env from 'dotenv';
import { logger } from './logger';
env.config();

const { TOKEN, CLIENT_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  throw new Error('Missing environment variables.');
}

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  new SlashCommandBuilder()
    .setName('banish')
    .setDescription('Banishes the previous message to the Shadow Realm.'),
  new SlashCommandBuilder()
    .setName('level')
    .setDescription(
      'Tells you how much more hours are needed for the next level.',
    ),
  new SlashCommandBuilder()
    .setName('turtles')
    .setDescription('WHERE ARE THE TURTLES?'),
  new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('Starts playing Minecraft in an empty voice channel.'),
  new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leaves any voice channel it is currently in.'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands })
  .then((data) =>
    logger(
      `Successfully registered ${
        (data as RESTPostAPIApplicationCommandsJSONBody[]).length
      } application commands.`,
    ),
  )
  .catch(console.error);
