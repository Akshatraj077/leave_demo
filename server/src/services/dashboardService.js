import { Holiday } from "../models/Holiday.js";
import { Leave } from "../models/Leave.js";
import { LeaveBalance } from "../models/LeaveBalance.js";
import { User } from "../models/User.js";
import { buildCalendar } from "./calendarService.js";
import { getPendingReservedAmount, getOrCreateBalance, serializeLeave } from "./leaveService.js";
import { formatDateKey, getFinancialYear, normalizeDate } from "../utils/date.js";
import { sanitizeUser } from "../utils/mask.js";

const GLOBAL_LOCATIONS = ["All", "ALL", "Global", "GLOBAL"];

export async function getEmployeeDashboard(user, month, year) {
  const financialYear = getFinancialYear();
  const balance = await getOrCreateBalance(user._id, financialYear);
  const reservedLeaves = await getPendingReservedAmount(user._id, financialYear);
  const today = normalizeDate(new Date());
  const holidays = await Holiday.find({
    date: { $gte: today },
    location: { $in: [user.location, ...GLOBAL_LOCATIONS] }
  })
    .sort({ date: 1 })
    .limit(5);
  const recentLeaves = await Leave.find({ user: user._id }).sort({ date: -1 }).limit(5);
  const calendar = await buildCalendar(user, month, year);

  return {
    role: "EMPLOYEE",
    profile: sanitizeUser(user),
    balance: {
      financialYear,
      totalLeaves: balance.totalLeaves,
      usedLeaves: balance.usedLeaves,
      remainingLeaves: Math.max(balance.remainingLeaves - reservedLeaves, 0),
      reservedLeaves
    },
    upcomingHolidays: holidays.map((holiday) => ({
      id: String(holiday._id),
      name: holiday.name,
      date: formatDateKey(holiday.date),
      day: holiday.day,
      occasion: holiday.occasion,
      location: holiday.location
    })),
    recentLeaves: recentLeaves.map(serializeLeave),
    calendar
  };
}

export async function getAdminDashboard(month, year) {
  const financialYear = getFinancialYear();
  const [employeeCount, pendingLeaves, activeCount, noticeCount, probationCount, balances] = await Promise.all([
    User.countDocuments({ role: "EMPLOYEE" }),
    Leave.find({ status: "APPLIED" }).populate("user").sort({ createdAt: -1 }).limit(6),
    User.countDocuments({ role: "EMPLOYEE", employmentStatus: "ACTIVE" }),
    User.countDocuments({ role: "EMPLOYEE", employmentStatus: "NOTICE_PERIOD" }),
    User.countDocuments({ role: "EMPLOYEE", employmentStatus: "PROBATION" }),
    LeaveBalance.find({ financialYear })
  ]);

  const totalUsed = balances.reduce((sum, balance) => sum + balance.usedLeaves, 0);
  const totalRemaining = balances.reduce((sum, balance) => sum + balance.remainingLeaves, 0);
  const firstEmployee = await User.findOne({ role: "EMPLOYEE" }).sort({ createdAt: 1 });
  const calendar = firstEmployee ? await buildCalendar(firstEmployee, month, year) : [];

  return {
    role: "ADMIN",
    summary: {
      employeeCount,
      activeCount,
      noticeCount,
      probationCount,
      pendingCount: pendingLeaves.length,
      totalUsed,
      totalRemaining,
      financialYear
    },
    pendingLeaves: pendingLeaves.map(serializeLeave),
    calendar
  };
}
