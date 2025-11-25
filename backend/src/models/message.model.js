import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    content: {
        type: String,
        trim: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    }
}, { timestamps: true });

const Message = mongoose.model("message", MessageSchema);
export default Message;