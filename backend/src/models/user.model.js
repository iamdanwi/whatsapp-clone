import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    about: {
        type: String,
        default: "Hey there I using this app",
        required: true
    },
    avatar: {
        type: String,
        default: "https://avatars.githubusercontent.com/u/188289429?s=96&v=4",
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

const User = mongoose.model('user', UserSchema);

export default User;