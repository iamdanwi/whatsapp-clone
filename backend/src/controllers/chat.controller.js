import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        const populatedChats = await User.populate(chats, {
            path: "lastMessage.sender",
            select: "name avatar email",
        });

        res.status(200).json(populatedChats);
    } catch (error) {
        console.log("Error in getChats controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getChat = async (req, res) => {
    try {
        const { id } = req.params;

        const chat = await Chat.findById(id)
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("lastMessage");

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.log("Error in getChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createGroupChat = async (req, res) => {
    try {
        const { users, name } = req.body;

        if (!users || !name) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        let parsedUsers = users;
        if (typeof users === "string") {
            parsedUsers = JSON.parse(users);
        }

        if (parsedUsers.length < 2) {
            return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
        }

        parsedUsers.push(req.user);

        const groupChat = await Chat.create({
            groupName: name,
            users: parsedUsers,
            isGroup: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        console.log("Error in createGroupChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createDirectChat = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "UserId param not sent with request" });
        }

        let isChat = await Chat.find({
            isGroup: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("lastMessage");

        isChat = await User.populate(isChat, {
            path: "lastMessage.sender",
            select: "name avatar email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                groupName: "sender",
                isGroup: false,
                users: [req.user._id, userId],
            };

            try {
                const createdChat = await Chat.create(chatData);
                const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                    "users",
                    "-password"
                );
                res.status(200).json(FullChat);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        }
    } catch (error) {
        console.log("Error in createDirectChat controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.json(added);
        }
    } catch (error) {
        console.log("Error in addToGroup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404).json({ message: "Chat Not Found" });
        } else {
            res.json(removed);
        }
    } catch (error) {
        console.log("Error in removeFromGroup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
