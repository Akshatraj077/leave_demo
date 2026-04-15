import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "development-only-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookieSecure: String(process.env.COOKIE_SECURE || "false") === "true"
};

export function assertRequiredEnv() {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required. Add it to server/.env.");
  }
}
