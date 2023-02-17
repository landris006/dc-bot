import { VoiceState } from 'discord.js';
import { client } from '..';
import { channelChange } from '../handlers/voiceStateHandlers/channelChange';
import { connection } from '../handlers/voiceStateHandlers/connection';
import { disconnection } from '../handlers/voiceStateHandlers/disconnection';
import { minecraft } from '../handlers/voiceStateHandlers/minecraft';

export const voiceStateRouter = async (
  oldState: VoiceState,
  newState: VoiceState,
) => {
  const botID = client.user?.id;

  if (!botID) {
    return;
  }

  // Other bot connect
  if (newState.member?.user.bot && newState.member.user.id !== botID) {
    return;
  }

  // Bot connect
  if (!oldState.channelId && newState.member?.user.id === botID) {
    client.state.currentConnection = newState?.member?.voice as VoiceState;
    return;
  }

  // Bot disconnect
  if (oldState.member?.user.id === botID && !newState.channelId) {
    client.state.currentConnection = null;
    client.state.isPlayingMinecraft = null;
    return;
  }

  if (newState.channelId === client.state.isPlayingMinecraft) {
    minecraft(oldState, newState);
  }

  if (newState.channelId && !oldState.channelId) {
    await connection(newState);
  }

  if (!newState.channelId && oldState.channelId) {
    await disconnection(oldState, oldState.channel?.name as string);
  }

  if (
    oldState.channelId &&
    newState.channelId &&
    oldState.channelId !== newState.channelId
  ) {
    await channelChange(oldState, newState);
  }
};
