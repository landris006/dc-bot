import {
  REST,
  SlashCommandBuilder,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import env from 'dotenv';
env.config();

const { TOKEN, CLIENT_ID } = process.env;
if (!TOKEN || !CLIENT_ID) {
  throw new Error('Missing environment variables.');
}

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands })
  .then((data) =>
    console.log(
      `Successfully registered ${
        (data as RESTPostAPIApplicationCommandsJSONBody[]).length
      } application commands.`
    )
  )
  .catch(console.error);
