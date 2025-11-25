import Call from "../models/call.model.js";
import User from "../models/user.model.js";

export const initiateCall = async (req, res) => {
    try {
        const { receiverId, callType } = req.body;

        if (!receiverId || !callType) {
            return res.status(400).json({ message: "Receiver ID and Call Type are required" });
        }

        const newCall = new Call({
            caller: req.user._id,
            receiver: receiverId,
            callType: callType,
            callStatus: "initiated",
            startedAt: Date.now(),
        });

        await newCall.save();

        const populatedCall = await Call.findById(newCall._id)
            .populate("caller", "name avatar")
            .populate("receiver", "name avatar");

        res.status(200).json(populatedCall);
    } catch (error) {
        console.log("Error in initiateCall controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getCallHistory = async (req, res) => {
    try {
        const calls = await Call.find({
            $or: [{ caller: req.user._id }, { receiver: req.user._id }],
        })
            .populate("caller", "name avatar")
            .populate("receiver", "name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json(calls);
    } catch (error) {
        console.log("Error in getCallHistory controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
