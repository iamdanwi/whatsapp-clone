import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const fixDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Connected to MongoDB");

        const collection = mongoose.connection.collection("users");
        const indexes = await collection.indexes();

        const socketIdIndex = indexes.find(idx => idx.key.socketId === 1);

        if (socketIdIndex) {
            await collection.dropIndex(socketIdIndex.name);
            console.log("Dropped socketId index");
        } else {
            console.log("socketId index not found");
        }

        console.log("Database fix complete");
        process.exit(0);
    } catch (error) {
        console.error("Error fixing DB:", error);
        process.exit(1);
    }
};

fixDb();
