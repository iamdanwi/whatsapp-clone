import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            return res.status(400).json({ message: "Invalid data passed into request" });
        }

        var newMessage = {
            sender: req.user._id,
            content: content,
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

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("Error in deleteMessage controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
