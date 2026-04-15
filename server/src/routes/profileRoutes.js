import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { normalizeDate } from "../utils/date.js";
import { sanitizeUser } from "../utils/mask.js";
import { validateEmployeePayload } from "../utils/validators.js";

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", (req, res) => {
  res.json({ profile: sanitizeUser(req.user, { includeSensitive: true }) });
});

profileRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const payload = {
      dateOfBirth: req.body.dateOfBirth ? normalizeDate(req.body.dateOfBirth) : undefined,
      panNumber: req.body.panNumber?.trim().toUpperCase(),
      bankAccountNumber: req.body.bankAccountNumber?.trim(),
      bankName: req.body.bankName?.trim(),
      ifscCode: req.body.ifscCode?.trim().toUpperCase(),
      accountHolderName: req.body.accountHolderName?.trim(),
      location: req.body.location?.trim()
    };
    const cleanedPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    const errors = validateEmployeePayload(cleanedPayload, { partial: true });
    if (Object.keys(errors).length) {
      throw new AppError("Profile validation failed", 400, errors);
    }

    for (const [field, value] of Object.entries(cleanedPayload)) {
      req.user[field] = value;
    }

    await req.user.save();
    res.json({ profile: sanitizeUser(req.user, { includeSensitive: true }) });
  })
);
