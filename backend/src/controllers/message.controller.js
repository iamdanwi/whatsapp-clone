import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

import { io } from "../sockets/socket.js";

import cloudinary from "../lib/cloudinary.js";

export const sendMessage = async (req, res) => {
    try {
        const { content, chatId, image } = req.body;

        if ((!content && !image) || !chatId) {
            return res.status(400).json({ message: "Invalid data passed into request" });
        }

        let imageUrl = null;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        var newMessage = {
            sender: req.user._id,
            content: content,
            image: imageUrl,
            chatId: chatId,
        };

        try {
            var message = await Message.create(newMessage);

            message = await message.populate("sender", "name avatar");
            message = await message.populate("chatId");
            message = await User.populate(message, {
                path: "chatId.users",
                select: "name avatar email",
            });

            await Chat.findByIdAndUpdate(req.body.chatId, {
                lastMessage: message,
            });

            res.status(200).json(message);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        const messages = await Message.find({ chatId })
            .populate("sender", "name avatar email")
            .populate("chatId");

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the user is the sender of the message
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "You are not authorized to delete this message" });
        }

        // Soft delete: Update content and set isDeleted flag (if we had one, or just text)
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { content: "This message was deleted", image: null }, // Clear image if any
            { new: true }
        );

        // Emit event to chat room
        // I can import io here? No, circular dependency if socket imports controller.
        // Usually we attach io to req in middleware or export a function to get it.
        // Let's check how sendMessage does it.
        // sendMessage uses `addMessageToQueue`. The worker likely emits the event.
        // `messageWorker.js` likely imports `io`.

        // For delete, I can just emit it here if I can access io.
        // Or I can use the `getReceiverSocketId` helper if I import it?
        // Let's try to import `io` from `../sockets/socket.js`.

        // But wait, `socket.js` imports `messageQueue`? No.
        // `socket.js` imports `addMessageToQueue`.
        // If I import `io` from `socket.js` in `message.controller.js`, is it circular?
        // `socket.js` -> `messageQueue` -> ...
        // `message.controller.js` -> `message.model.js`
        // It should be fine.

        // Let's assume I can import { io } from "../sockets/socket.js";

        // But wait, I need to know who to emit to. The chat users.
        // I need to populate chat users to get their IDs?
        // The message has `chatId`. I can emit to the room `chatId`.
        // `io.to(chatId).emit("messageDeleted", messageId);`

        // I need to fetch the message with chatId populated?
        // `updatedMessage` has `chatId`.

        // Let's verify imports first.

        res.status(200).json(updatedMessage);
    } catch (error) {
        console.log("Error in deleteMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
