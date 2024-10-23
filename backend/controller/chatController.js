import Chat from "../models/chatModel.js";

export const createChat = async (req, res) => {
  try {
    const { participants } = req.body;
    const chat = new Chat({
      participants,
    });
    await chat.save();
    return res.status(200).send(chat);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

export const createChatSocket = async (participants, message) => {
  try {
    const chat = new Chat({
      participants,
      messages: message ? [message] : [],
    });
    let savedChat = await chat.save();
    return savedChat;
  } catch (error) {
    return;
  }
};

export const findChatsByParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    let chats = await Chat.find({ participants: id });
    return res.status(200).send(chats);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

export const findChatsWithProfilesByParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    let chats = await Chat.find({ participants: id })
      .populate({
        path: "participants",
        select: "id firstName lastName",
      })
      .populate({
        path: "messages.sender",
        select: "id firstName lastName",
      });
    return res.status(200).send(chats);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

export const addChatMessage = async (req, res) => {
  try {
    const { chatID, message, sender } = req.body;
    let chat = await Chat.findById(chatID);

    if (!chat) {
      return res.status(404).send("Chat not found");
    }

    if (!chat.participants.includes(sender)) {
      return res.status(403).send("Forbidden");
    }

    chat.messages.push({ message, sender });
    await chat.save();
    return res.status(200).send(chat);
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

export const addChatMessageSocket = async (msg) => {
  try {
    let { chatID, message, sender } = msg;
    let chat = await Chat.findById(chatID);
    if (!chat) {
      chat = await createChatSocket({ participants: chatID });
    }
    if (!chat.participants.includes(sender)) {
      return;
    }
    chat.messages.push({ message, sender });
    await chat.save();
    return chat;
  } catch (error) {
    return;
  }
};

export const deleteChatbyID = async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    return res.status(200).send("ok");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
};

export const deleteChatByIDSocket = async (chatId) => {
  try {
    await Chat.findByIdAndDelete(chatId);
    return true;
  } catch (error) {
    return null;
  }
};

export default {
  createChat,
  createChatSocket,
  findChatsByParticipant,
  addChatMessage,
  addChatMessageSocket,
  deleteChatbyID,
  deleteChatByIDSocket,
};
