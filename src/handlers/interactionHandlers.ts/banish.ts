import {
  CommandInteraction,
  ChannelType,
  GuildTextBasedChannel,
} from 'discord.js';

export const banish = async (interaction: CommandInteraction) => {
  const lastMessage = (
    await interaction.channel?.messages.fetch({ limit: 1 })
  )?.first();

  if (!lastMessage) {
    return interaction.reply('No message to banish!');
  }

  let shadowRealmChannel = interaction.guild?.channels.cache.find((channel) => {
    return channel.name === 'shadow-realm';
  });

  if (!shadowRealmChannel) {
    shadowRealmChannel = await interaction.guild?.channels.create({
      name: 'shadow-realm',
      type: ChannelType.GuildText,
    });
  }

  if (!shadowRealmChannel) {
    return interaction.reply('Could not create or find Shadow Realm channel!');
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
