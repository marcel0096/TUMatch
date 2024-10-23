import chatController from "../controller/chatController.js";
import { getSocketIdByUserId } from "./socketMap.js";

export default function (socket, io) {
  socket.on("chat message", async (msg) => {
    let chat = await chatController.addChatMessageSocket(msg.message);
    chat.participants.forEach((participant) => {
      try {
        if (io.sockets.adapter.rooms.has(participant.toString())) {
          if (msg.sender.toString() !== participant.toString()) {
            console.log(
              "sending message notification to: " + participant.toString()
            );
            io.to(participant.toString()).emit("message notification", {
              sender: msg.sender,
              message: msg.message,
            });
          }
          io.to(participant.toString()).emit("change in chat", {
            chatId: msg.chatID,
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });

  socket.on("create chat", async (msg) => {
    let participants = msg.participants;
    let message = msg.message;
    let creator = msg.creator;

    let chat = await chatController.createChatSocket(participants, message);

    chat.participants.forEach((participant) => {
      try {
        if (io.sockets.adapter.rooms.has(participant.toString())) {
          io.to(participant.toString()).emit("change in chat", {
            chatId: chat._id.toString(),
            creator: creator,
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  });

  socket.on("delete chat", async (msg) => {
    let chatId = msg.chatId;
    let formerParticipcants = msg.participants;
    let chat = await chatController.deleteChatByIDSocket(chatId);

    formerParticipcants.forEach((participant) => {
      try {
        if (io.sockets.adapter.rooms.has(participant.toString())) {
          io.to(participant.toString()).emit("delete local chat", chatId);
        }
      } catch (error) {
        console.log(error);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
}
