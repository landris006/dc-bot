import { Client } from 'discord.js';
import { ClientState } from '..';
import { messageHandler } from '../handlers/message';
import { startup } from '../handlers/startup';
import { channelUpdate } from '../handlers/updateHandlers/channelUpdate';
import { guildMemberUpdate } from '../handlers/updateHandlers/guildMemberUpdate';
import { interactionRouter } from './interaction';
import { voiceStateRouter } from './voiceState';

export const eventRouter = (
  client: Client & {
    state: ClientState;
  },
) => {
  client.once('ready', startup);
  client.on('guildCreate', startup);
  client.on('voiceStateUpdate', voiceStateRouter);
  client.on('interactionCreate', interactionRouter);
  client.on('messageCreate', messageHandler);
  client.on('channelCreate', channelUpdate);
  client.on('channelUpdate', (_, newChannel) => {
    if (newChannel.isDMBased()) {
      return;
    }

    channelUpdate(newChannel);
  });
  client.on('guildMemberAdd', guildMemberUpdate);
  client.on('guildMemberUpdate', (_, newMember) => {
    guildMemberUpdate(newMember);
  });
};
