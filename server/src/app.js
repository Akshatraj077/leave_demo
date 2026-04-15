import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  // app.use(cors({
  //   origin: [
  //     "http://localhost:5173",
  //     "https://leavedemo.vercel.app"
  //   ],
  //   credentials: true
  // }));
  app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://leavedemo.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.options("*", cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({
      name: "Leave Management & Employee HR System API",
      status: "running"
    });
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
