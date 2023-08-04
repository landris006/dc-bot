import {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import { client } from '../..';

export const turtles = async (interaction: CommandInteraction) => {
  const channelId = (interaction.member as GuildMember).voice.channelId;

  if (!channelId) {
    return interaction.reply('You must be in a voice channel for this command to work!');
  }

  client.state.isPlayingMinecraft = null;

  if (!interaction.guild?.voiceAdapterCreator) {
    return;
  }

  const connection = joinVoiceChannel({
    channelId,
    guildId: interaction.guild?.id as string,
    adapterCreator: interaction.guild.voiceAdapterCreator,
    group: 'client',
  });

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  const resource = createAudioResource(`${process.cwd()}/assets/sound/where-are-the-turtles.mp3`);

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();
    connection.destroy();
    client.state.currentConnection = null;
  });

  return interaction.reply('Where are the turtles?');
};
