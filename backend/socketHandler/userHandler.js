import { addSocket, removeSocket } from "./socketMap.js";

export default function (socket) {
  socket.on("login message", (userId) => {
    if (userId !== "" || userId !== null) {
      socket.join(userId);
      addSocket(socket, userId);
    }
  });

  socket.on("disconnect", () => {
    removeSocket(socket.id);
  });
}
