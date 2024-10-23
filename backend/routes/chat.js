import {
  createChat,
  findChatsByParticipant,
  addChatMessage,
  findChatsWithProfilesByParticipant,
  deleteChatbyID,
} from "../controller/chatController.js";
import checkAuthentication from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/create", createChat);
router.get("/byParticipant/:id", findChatsWithProfilesByParticipant);
router.post("/addMessage", addChatMessage);
router.get("/byParticipant/:id", findChatsByParticipant);
router.delete("/delete/:id", checkAuthentication, deleteChatbyID);

export default router;
