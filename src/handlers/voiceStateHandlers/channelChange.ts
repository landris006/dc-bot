import { VoiceState } from 'discord.js';
import { disconnection } from './disconnection';
import { connection } from './connection';

export const channelChange = async (
  oldState: VoiceState,
  newState: VoiceState
) => {
  await disconnection(oldState, oldState.channel?.name as string);
  await connection(newState);
};
