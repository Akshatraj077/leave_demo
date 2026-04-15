import { Holiday } from "../models/Holiday.js";
import { Leave } from "../models/Leave.js";
import { LeaveBalance } from "../models/LeaveBalance.js";
import { AppError, notFound } from "../utils/appError.js";
import { durationToAmount, formatDateKey, getFinancialYear, isSunday, normalizeDate } from "../utils/date.js";

const GLOBAL_LOCATIONS = ["All", "ALL", "Global", "GLOBAL"];

export async function getOrCreateBalance(userId, financialYear, defaultTotal = 12) {
  let balance = await LeaveBalance.findOne({ user: userId, financialYear });
  if (!balance) {
    balance = await LeaveBalance.create({
      user: userId,
      financialYear,
      totalLeaves: defaultTotal,
      usedLeaves: 0,
      remainingLeaves: defaultTotal
    });
  }
  return balance;
}

export async function getPendingReservedAmount(userId, financialYear) {
  const pendingLeaves = await Leave.find({
    user: userId,
    financialYear,
    status: "APPLIED",
    leaveType: "CL"
  });

  return pendingLeaves.reduce((total, leave) => total + durationToAmount(leave.duration), 0);
}

export async function findHolidayForUser(date, user) {
  return Holiday.findOne({
    date,
    location: { $in: [user.location, ...GLOBAL_LOCATIONS] }
  });
}

export async function applyLeave(user, payload) {
  const date = normalizeDate(payload.date);
  if (!date) {
    throw new AppError("Enter a valid leave date");
  }

  const duration = String(payload.duration || "FULL").toUpperCase();
  if (!["FULL", "HALF"].includes(duration)) {
    throw new AppError("Duration must be FULL or HALF");
  }

  if (user.employmentStatus === "NOTICE_PERIOD") {
    throw new AppError("Leave cannot be applied during notice period");
  }

  if (isSunday(date)) {
    throw new AppError("Leave cannot be applied on Sunday");
  }

  const holiday = await findHolidayForUser(date, user);
  if (holiday) {
    throw new AppError(`Leave cannot be applied on holiday: ${holiday.name}`);
  }

  const duplicate = await Leave.findOne({ user: user._id, date });
  if (duplicate) {
    throw new AppError("Leave already exists for this date", 409);
  }

  const financialYear = getFinancialYear(date);
  const amount = durationToAmount(duration);
  const balance = await getOrCreateBalance(user._id, financialYear);
  const reserved = await getPendingReservedAmount(user._id, financialYear);
  const available = Math.max(balance.remainingLeaves - reserved, 0);
  const leaveType = amount <= available ? "CL" : "LOP";

  return Leave.create({
    user: user._id,
    date,
    duration,
    leaveType,
    status: "APPLIED",
    financialYear
  });
}

export async function approveLeave(leaveId, adminUser) {
  const leave = await Leave.findById(leaveId).populate("user");
  if (!leave) {
    throw notFound("Leave request");
  }
  if (leave.status !== "APPLIED") {
    throw new AppError("Only applied leave requests can be approved");
  }

  if (leave.leaveType === "CL") {
    const amount = durationToAmount(leave.duration);
    const balance = await getOrCreateBalance(leave.user._id, leave.financialYear);

    if (balance.remainingLeaves >= amount) {
      balance.usedLeaves += amount;
      balance.remainingLeaves = Math.max(balance.totalLeaves - balance.usedLeaves, 0);
      await balance.save();
    } else {
      leave.leaveType = "LOP";
    }
  }

  leave.status = "APPROVED";
  leave.decisionBy = adminUser._id;
  leave.decisionAt = new Date();
  await leave.save();
  return leave.populate("user");
}

export async function rejectLeave(leaveId, adminUser) {
  const leave = await Leave.findById(leaveId).populate("user");
  if (!leave) {
    throw notFound("Leave request");
  }
  if (leave.status !== "APPLIED") {
    throw new AppError("Only applied leave requests can be rejected");
  }

  leave.status = "REJECTED";
  leave.decisionBy = adminUser._id;
  leave.decisionAt = new Date();
  await leave.save();
  return leave;
}

export function serializeLeave(leave) {
  const source = typeof leave.toObject === "function" ? leave.toObject() : leave;
  return {
    id: String(source._id || source.id),
    user: source.user && typeof source.user === "object"
      ? {
          id: String(source.user._id || source.user.id),
          name: source.user.name,
          email: source.user.email,
          companyId: source.user.companyId,
          location: source.user.location
        }
      : source.user,
    date: formatDateKey(source.date),
    leaveType: source.leaveType,
    duration: source.duration,
    status: source.status,
    financialYear: source.financialYear,
    decisionAt: source.decisionAt,
    createdAt: source.createdAt
  };
}
