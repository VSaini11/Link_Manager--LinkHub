// lib/mongodb.ts
import mongoose from "mongoose";

let isConnected = false;

export const dbConnect = async (): Promise<void> => {
  if (isConnected) return;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    const db = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "linkManagerDB",
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isConnected = false;
    // Don't throw error to allow graceful degradation
    console.warn("⚠️ MongoDB connection failed, API will return empty data");
  }
};
