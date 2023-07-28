import { Client, Events } from 'discord.js';
import { ClientState } from '..';
import { messageHandler } from '../handlers/message';
import { startup } from '../handlers/startup';
import { channelUpdate } from '../handlers/updateHandlers/channelUpdate';
import { guildMemberUpdate } from '../handlers/updateHandlers/guildMemberUpdate';
import { channelStatusUpdate } from '../handlers/voiceStateHandlers/channelStatusUpdate';
import { interactionRouter } from './interaction';
import { voiceStateRouter } from './voiceState';

export const eventRouter = (
  client: Client & {
    state: ClientState;
  },
) => {
  client.once(Events.ClientReady, startup);
  client.on(Events.GuildCreate, startup);
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    await voiceStateRouter(oldState, newState);
    await channelStatusUpdate(newState);
  });
  client.on(Events.InteractionCreate, interactionRouter);
  client.on(Events.MessageCreate, messageHandler);
  client.on(Events.ChannelCreate, channelUpdate);
  client.on(Events.ChannelUpdate, (_, newChannel) => {
    if (newChannel.isDMBased()) {
      return;
    }

    channelUpdate(newChannel);
  });
  client.on(Events.GuildMemberAdd, guildMemberUpdate);
  client.on(Events.GuildMemberUpdate, (_, newMember) => {
    guildMemberUpdate(newMember);
  });
};
