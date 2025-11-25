import { Server } from "socket.io";
import http from "http";
import express from "express";
import { addMessageToQueue } from "../queue/messageQueue.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("sendMessage", async (data) => {
        const { senderId, content, chatId } = data;

        try {
            await addMessageToQueue({
                senderId,
                content,
                chatId,
            });
        } catch (error) {
            console.error("Error adding message to queue:", error);
        }
    });

    socket.on("call user", (data) => {
        const receiverSocketId = getReceiverSocketId(data.userToCall);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callUser", {
                signal: data.signalData,
                from: data.from,
                name: data.name,
                type: data.type,
            });
        }
    });

    socket.on("answer call", (data) => {
        const callerSocketId = getReceiverSocketId(data.to);
        if (callerSocketId) {
            io.to(callerSocketId).emit("callAccepted", data.signal);
        }
    });

    socket.on("call ended", (data) => {
        const receiverSocketId = getReceiverSocketId(data.to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("callEnded");
        }
    });

    socket.on("toggleVideo", (data) => {
        const receiverSocketId = getReceiverSocketId(data.to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("toggleVideo", data.isVideoOff);
        }
    });
});

export { app, io, server };
