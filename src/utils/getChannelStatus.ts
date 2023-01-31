import { Collection } from "@discordjs/collection";
import { GuildBasedChannel } from "discord.js";

export const getGuildChannelStatus = (channels: Collection<string, GuildBasedChannel>) => {
    return channels.reduce<{
    [key: string]: string[];
  }>((status, channel) => {
    if (!channel.isVoiceBased()) {
      return status;
    }

    status[channel.id] = channel.members.map((member) => member.user.id);

    return status;
  }, {});
}
