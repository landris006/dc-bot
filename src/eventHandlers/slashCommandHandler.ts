import {
  ChannelType,
  CommandInteraction,
  GuildTextBasedChannel,
} from 'discord.js';
import { prisma } from '../index';
import { Conversions } from '../utils/conversions';

export namespace slashCommandInteractionHandlers {
  export const ping = (interaction: CommandInteraction) => {
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
}
