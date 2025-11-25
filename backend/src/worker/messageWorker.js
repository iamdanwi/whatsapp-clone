import { Worker } from "bullmq";
import IORedis from "ioredis";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../sockets/socket.js";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
});

const worker = new Worker(
    "messageQueue",
    async (job) => {
        const { senderId, content, chatId } = job.data;

        try {
            var newMessage = {
                sender: senderId,
                content: content,
                chatId: chatId,
            };

            var message = await Message.create(newMessage);

            message = await message.populate("sender", "name avatar");
            message = await message.populate("chatId");
            message = await User.populate(message, {
                path: "chatId.users",
                select: "name avatar email",
            });

            await Chat.findByIdAndUpdate(chatId, {
                lastMessage: message,
            });

            // Emit to socket
            if (!message.chatId.users) return console.log("chat.users not defined");

            message.chatId.users.forEach((user) => {
                if (user._id == message.sender._id) return;

                const socketId = getReceiverSocketId(user._id);
                if (socketId) {
                    io.to(socketId).emit("message received", message);
                }
            });

            return message;
        } catch (error) {
            console.error("Error processing message job:", error);
            throw error;
        }
    },
    { connection }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed with ${err.message}`);
});

export default worker;
