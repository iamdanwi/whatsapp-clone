import express from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/:chatId", protectRoute, getMessages);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
