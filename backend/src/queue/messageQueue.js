import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null,
});

export const messageQueue = new Queue("messageQueue", {
    connection,
});

export const addMessageToQueue = async (data) => {
    await messageQueue.add("sendMessage", data, {
        removeOnComplete: true,
        removeOnFail: true,
    });
};
