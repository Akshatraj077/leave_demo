import { Router } from "express";
import { Holiday } from "../models/Holiday.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/appError.js";
import { formatDateKey, getDayName, normalizeDate } from "../utils/date.js";

export const holidayRouter = Router();

function serializeHoliday(holiday) {
  return {
    id: String(holiday._id),
    name: holiday.name,
    date: formatDateKey(holiday.date),
    day: holiday.day,
    occasion: holiday.occasion,
    location: holiday.location
  };
}

function normalizeHolidayPayload(payload, { partial = false } = {}) {
  const date = payload.date ? normalizeDate(payload.date) : undefined;
  const normalized = {
    name: payload.name?.trim(),
    date,
    day: date ? getDayName(date) : payload.day?.trim(),
    occasion: payload.occasion?.trim(),
    location: payload.location !== undefined ? payload.location?.trim() || "Kolkata" : partial ? undefined : "Kolkata"
  };

  if (!partial) {
    const missing = ["name", "date", "occasion", "location"].filter((field) => !normalized[field]);
    if (missing.length) {
      throw new AppError("Holiday validation failed", 400, Object.fromEntries(missing.map((field) => [field, "Required"])));
    }
  }

  if (payload.date !== undefined && !date) {
    throw new AppError("Enter a valid holiday date");
  }

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
}

holidayRouter.use(requireAuth);

holidayRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.location) {
      query.location = req.query.location;
    }
    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json({ holidays: holidays.map(serializeHoliday) });
  })
);

holidayRouter.post(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = normalizeHolidayPayload(req.body);
    const holiday = await Holiday.create(payload);
    res.status(201).json({ holiday: serializeHoliday(holiday) });
  })
);

holidayRouter.patch(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      throw notFound("Holiday");
    }
    const payload = normalizeHolidayPayload(req.body, { partial: true });
    for (const [field, value] of Object.entries(payload)) {
      holiday[field] = value;
    }
    if (holiday.date && !req.body.day) {
      holiday.day = getDayName(holiday.date);
    }
    await holiday.save();
    res.json({ holiday: serializeHoliday(holiday) });
  })
);

holidayRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) {
      throw notFound("Holiday");
    }
    res.json({ message: "Holiday deleted" });
  })
);
