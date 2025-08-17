// lib/mongodb.ts
import mongoose from "mongoose";

let isConnected = false;

export const dbConnect = async (): Promise<void> => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "linkManagerDB",
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
};
