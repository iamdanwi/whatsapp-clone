import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    callType: {
        type: String,
        enum: ['audio', 'video'],
        required: true
    },
    callStatus: {
        type: String,
        enum: ['initiated', 'ringing', 'answered', 'ended', 'missed'],
        default: 'initiated'
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    },
    duration: {
        type: Number // duration in seconds
    }
}, { timestamps: true });

const Call = mongoose.model("call", CallSchema);
export default Call;