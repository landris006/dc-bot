import { joinVoiceChannel } from '@discordjs/voice';
import { CommandInteraction, Collection, GuildMember } from 'discord.js';
import { client } from '../..';

export const minecraft = async (interaction: CommandInteraction) => {
  if (client.state.isPlayingMinecraft) {
    return interaction.reply('Already playing Minecraft!');
  }

  const avaliableChannels = interaction.guild?.channels.cache.filter(
    (channel) =>
      (channel.members as Collection<string, GuildMember>).size === 0 &&
      !channel.name.toLowerCase().includes('afk')
  );

  if (!avaliableChannels?.size) {
    return interaction.reply('No empty channels available!');
  }

  const channelToJoin = avaliableChannels.first()!;
  joinVoiceChannel({
    channelId: channelToJoin.id as string,
    guildId: interaction.guild?.id as string,
    group: 'client',
    adapterCreator: interaction.guild?.voiceAdapterCreator!,
  });

  client.state.isPlayingMinecraft = channelToJoin.id;

  interaction.reply(`Started playing Minecrat in '${channelToJoin.name}'`);
};
