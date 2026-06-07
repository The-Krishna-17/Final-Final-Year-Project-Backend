import mongoose from "mongoose";
import { env } from "./env.js";

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.MONGODB_URI, MONGO_OPTIONS);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});
