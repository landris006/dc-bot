import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import { VoiceState } from 'discord.js';
import { client } from '../../index';

export const minecraft = (oldState: VoiceState, newState: VoiceState) => {
  const connection = getVoiceConnection(newState.guild.id, 'client');

  if (!client.state.currentConnection || !connection) {
    return;
  }

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });
  const resource = createAudioResource(
    `${process.cwd()}/assets/sound/get-out-of-my-room-im-playing-minecraft.mp3`,
  );

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    player.stop();

    newState.channel?.members.map((member) => {
      if (member.user.bot) {
        return;
      }

      if (!oldState) {
        return member.voice.disconnect();
      }

      return member.voice.setChannel(oldState.channelId);
    });
  });
};
