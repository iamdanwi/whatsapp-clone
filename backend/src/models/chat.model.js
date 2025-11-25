import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    isGroup: {
        type: Boolean,
        default: false
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    groupName: {
        type: String,
        default: "New Group"
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    }
}, { timestamps: true });

const Chat = mongoose.model("chat", ChatSchema);
export default Chat;