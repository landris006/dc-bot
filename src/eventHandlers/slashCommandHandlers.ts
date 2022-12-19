import {
  ChannelType,
  Collection,
  CommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
} from 'discord.js';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import { prisma } from '../index';
import { Conversions } from '../utils/conversions';
import { State } from '../index';

export namespace SlashCommandInteractionHandlers {
  export const ping = async (interaction: CommandInteraction) => {
    return interaction.reply('Pong!');
  };

  export const banish = async (interaction: CommandInteraction) => {
    const lastMessage = (
      await interaction.channel?.messages.fetch({ limit: 1 })
    )?.first();

    if (!lastMessage) {
      return interaction.reply('No message to banish!');
    }

    let shadowRealmChannel = interaction.guild?.channels.cache.find(
      (channel) => {
        return channel.name === 'shadow-realm';
      }
    );

    if (!shadowRealmChannel) {
      shadowRealmChannel = await interaction.guild?.channels.create({
        name: 'shadow-realm',
        type: ChannelType.GuildText,
      });
    }

    if (!shadowRealmChannel) {
      return interaction.reply(
        'Could not create or find Shadow Realm channel!'
      );
    }

    await (shadowRealmChannel as GuildTextBasedChannel).send({
      content: lastMessage.content,
      files: lastMessage.attachments.map((attachment) => attachment.url),
    });

    await lastMessage.delete();

    return interaction.reply(
      'Bro, you posted cringe, your message has been sent to the Shadow Realm.'
    );
  };

  export const level = async (interaction: CommandInteraction) => {
    const guildID = interaction.guild?.id as string;
    const userID = interaction.user.id;

    const member = await prisma.guildMember.findUnique({
      where: { guildID_userID: { guildID, userID } },
    });

    if (!member) {
      return interaction.reply(
        'You have no level! Join a channel to start leveling up!'
      );
    }

    const currentLevel = Conversions.HOURS_TO_LEVEL(member.hoursActive);
    return interaction.reply(
      `You have been active for ${
        Math.round(member.hoursActive * 100) / 100 // round to 2 decimal places workaround
      } hours, you will reach level ${
        currentLevel + 1
      } (${Conversions.LEVEL_TO_HOURS(currentLevel + 1)} hours) in ${
        Math.round(
          (Conversions.LEVEL_TO_HOURS(currentLevel + 1) - member.hoursActive) *
            100
        ) / 100
      } hours.`
    );
  };

  export const turtles = async (
    interaction: CommandInteraction,
    state: State
  ) => {
    const channelId = (interaction.member as GuildMember).voice.channelId;

    if (!channelId) {
      return interaction.reply(
        'You must be in a voice channel for this command to work!'
      );
    }

    state.isPlayingMinecraft = null;

    const connection = joinVoiceChannel({
      channelId,
      guildId: interaction.guild?.id as string,
      adapterCreator: interaction.guild?.voiceAdapterCreator!,
      group: 'client',
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    const resource = createAudioResource(
      `${process.cwd()}/assets/sound/where-are-the-turtles.mp3`
    );

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
      connection.destroy();
      state.currentConnection = null;
    });

    return interaction.reply('Where are the turtles?');
  };

  export const minecraft = async (
    interaction: CommandInteraction,
    state: State
  ) => {
    if (state.isPlayingMinecraft) {
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

    state.isPlayingMinecraft = channelToJoin.id;

    interaction.reply(`Started playing Minecrat in '${channelToJoin.name}'`);
  };

  export const leave = async (
    interaction: CommandInteraction,
    state: State
  ) => {
    if (!state.currentConnection) {
      return interaction.reply('Not connected to any voice channel!');
    }

    state.currentConnection.disconnect();

    interaction.reply('Left voice channel!');
  };
}
