import { Socket } from "socket.io";
import { prisma } from "..";

export const subscribe = async (socket: Socket, guildID: string) => {
  console.log(guildID);

  if (typeof guildID !== "string") {
    socket.emit("error", "'guildID' is not a string...");
    return;
  }

  const guild = await prisma.guild.findFirst({
    where: {
      id: guildID,
    },
  });

  if (!guild) {
    socket.emit("error", "'guildID' is not valid...");
    return;
  }

  socket.join(guild.id);
};
