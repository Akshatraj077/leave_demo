import bcrypt from "bcryptjs";
import { Router } from "express";
import { LeaveBalance } from "../models/LeaveBalance.js";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, notFound } from "../utils/appError.js";
import { getFinancialYear, normalizeDate } from "../utils/date.js";
import { sanitizeUser } from "../utils/mask.js";
import { isStrongPassword, validateEmployeePayload } from "../utils/validators.js";

export const employeeRouter = Router();

function normalizeEmployeePayload(payload) {
  return {
    name: payload.name?.trim(),
    email: payload.email?.trim().toLowerCase(),
    companyId: payload.companyId?.trim().toUpperCase(),
    role: payload.role ? (payload.role === "ADMIN" ? "ADMIN" : "EMPLOYEE") : undefined,
    employmentStatus: payload.employmentStatus,
    joiningDate: payload.joiningDate ? normalizeDate(payload.joiningDate) : undefined,
    dateOfBirth: payload.dateOfBirth ? normalizeDate(payload.dateOfBirth) : undefined,
    panNumber: payload.panNumber?.trim().toUpperCase(),
    bankAccountNumber: payload.bankAccountNumber?.trim(),
    bankName: payload.bankName?.trim(),
    ifscCode: payload.ifscCode?.trim().toUpperCase(),
    accountHolderName: payload.accountHolderName?.trim(),
    location: payload.location?.trim()
  };
}

async function attachBalances(users) {
  const financialYear = getFinancialYear();
  const balances = await LeaveBalance.find({
    user: { $in: users.map((user) => user._id) },
    financialYear
  });
  const balanceByUser = new Map(balances.map((balance) => [String(balance.user), balance]));

  return users.map((user) => ({
    ...sanitizeUser(user, { includeSensitive: true }),
    leaveBalance: balanceByUser.get(String(user._id)) || {
      financialYear,
      totalLeaves: 12,
      usedLeaves: 0,
      remainingLeaves: 12
    }
  }));
}

employeeRouter.use(requireAuth, requireRole("ADMIN"));

employeeRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await User.find({ role: "EMPLOYEE" }).sort({ name: 1 });
    res.json({ employees: await attachBalances(users) });
  })
);

employeeRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = normalizeEmployeePayload(req.body);
    const errors = validateEmployeePayload(payload);
    if (Object.keys(errors).length) {
      throw new AppError("Employee validation failed", 400, errors);
    }

    const password = String(req.body.password || "Employee@123");
    if (!isStrongPassword(password)) {
      throw new AppError("Password must contain at least 8 characters with uppercase, lowercase, number, and special character.");
    }

    const user = await User.create({
      ...payload,
      passwordHash: await bcrypt.hash(password, 12)
    });

    const totalLeaves = Number(req.body.totalLeaves || 12);
    await LeaveBalance.create({
      user: user._id,
      financialYear: getFinancialYear(),
      totalLeaves,
      usedLeaves: 0,
      remainingLeaves: totalLeaves
    });

    res.status(201).json({ employee: sanitizeUser(user, { includeSensitive: true }) });
  })
);

employeeRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw notFound("Employee");
    }

    const payload = normalizeEmployeePayload(req.body);
    const cleanedPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    const errors = validateEmployeePayload(cleanedPayload, { partial: true });
    if (Object.keys(errors).length) {
      throw new AppError("Employee validation failed", 400, errors);
    }

    const editableFields = [
      "name",
      "email",
      "companyId",
      "employmentStatus",
      "joiningDate",
      "dateOfBirth",
      "panNumber",
      "bankAccountNumber",
      "bankName",
      "ifscCode",
      "accountHolderName",
      "location"
    ];

    for (const field of editableFields) {
      if (cleanedPayload[field] !== undefined) {
        user[field] = cleanedPayload[field];
      }
    }

    if (req.body.password) {
      if (!isStrongPassword(req.body.password)) {
        throw new AppError("Password must contain at least 8 characters with uppercase, lowercase, number, and special character.");
      }
      user.passwordHash = await bcrypt.hash(req.body.password, 12);
    }

    await user.save();

    if (req.body.totalLeaves !== undefined) {
      const totalLeaves = Math.max(Number(req.body.totalLeaves), 0);
      const financialYear = getFinancialYear();
      const balance = await LeaveBalance.findOneAndUpdate(
        { user: user._id, financialYear },
        { $setOnInsert: { usedLeaves: 0 }, $set: { totalLeaves } },
        { upsert: true, new: true }
      );
      balance.remainingLeaves = Math.max(balance.totalLeaves - balance.usedLeaves, 0);
      await balance.save();
    }

    res.json({ employee: sanitizeUser(user, { includeSensitive: true }) });
  })
);
