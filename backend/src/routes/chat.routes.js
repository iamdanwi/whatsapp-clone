import express from "express";
import {
    getChats,
    getChat,
    createGroupChat,
    createDirectChat,
    addToGroup,
    removeFromGroup,
} from "../controllers/chat.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectRoute, getChats);
router.get("/:id", protectRoute, getChat);
router.post("/group", protectRoute, createGroupChat);
router.post("/", protectRoute, createDirectChat);
router.put("/groupadd", protectRoute, addToGroup);
router.put("/groupremove", protectRoute, removeFromGroup);

export default router;
