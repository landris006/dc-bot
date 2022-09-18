import { VoiceState } from 'discord.js';

export interface Connection {
  startTime: number;
  memberID: string;
  guildID: string;
}

export const voiceStateUpdateHandler = (
  oldState: VoiceState,
  newState: VoiceState,
  connections: Connection[]
): Connection[] => {
  if (oldState.channelId && newState.channelId) {
    return connections;
  }

  const newConnections = [...connections];

  // Connection
  if (!oldState.channelId) {
    newConnections.push({
      startTime: Date.now(),
      memberID: newState.member?.id!,
      guildID: newState.guild.id,
    });

    return newConnections;
  }

  // Disconnection
  if (!newState.channelId) {
    return newConnections.filter((connection) => {
      if (connection.memberID === newState.member?.id) {
        const timeSpent = Date.now() - connection.startTime;
        console.log(
          `${newState.member.nickname} left after: ${timeSpent / 1000} seconds`
        );

        return false;
      }

      return true;
    });
  }

  return connections;
};
