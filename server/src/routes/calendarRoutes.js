import { Router } from "express";
import { User } from "../models/User.js";
import { buildCalendar } from "../services/calendarService.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/appError.js";

export const calendarRouter = Router();

calendarRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    if (month < 1 || month > 12 || year < 2000 || year > 2100) {
      throw new AppError("Enter a valid month and year");
    }

    let user = req.user;
    if (req.user.role === "ADMIN" && req.query.userId) {
      user = await User.findById(req.query.userId);
      if (!user) {
        throw notFound("Employee");
      }
    }

    const calendar = await buildCalendar(user, month, year);
    res.json({ calendar, month, year });
  })
);
