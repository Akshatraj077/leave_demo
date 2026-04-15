import mongoose from "mongoose";
import { env, assertRequiredEnv } from "./env.js";

export async function connectDb() {
  assertRequiredEnv();
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
