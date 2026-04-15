import bcrypt from "bcryptjs";
import { Router } from "express";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { isStrongPassword, isValidCompanyId, isValidEmail } from "../utils/validators.js";
import { sanitizeUser } from "../utils/mask.js";
import { clearAuthCookie, requireAuth, setAuthCookie, signToken } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const companyId = String(req.body.companyId || "").trim().toUpperCase();
    const password = String(req.body.password || "");

    if (!isValidEmail(email) || !isValidCompanyId(companyId) || !password) {
      throw new AppError("Enter a valid email, company ID, and password");
    }

    const user = await User.findOne({ email, companyId });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user: sanitizeUser(user) });
  })
);

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

authRouter.patch(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");

    if (!currentPassword) {
      throw new AppError("Current password is required");
    }
    if (!isStrongPassword(newPassword)) {
      throw new AppError("New password must contain at least 8 characters with uppercase, lowercase, number, and special character.");
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    req.user.passwordHash = await bcrypt.hash(newPassword, 12);
    await req.user.save();
    res.json({ message: "Password changed successfully" });
  })
);
