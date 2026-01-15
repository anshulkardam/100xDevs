import type { ConnectOptions } from "mongoose";
import { config } from "./config";
import mongoose from "mongoose";

const clientOptions: ConnectOptions = {
  dbName: "100xAttendanceSystemDB",
  appName: "100xDevsASB",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error("MongoDB URI is not defined");
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    console.log("MongoDB Connected!");
  } catch (error) {
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected!");
  } catch (error) {
    throw error;
  }
};
