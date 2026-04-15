import { Holiday } from "../models/Holiday.js";
import { Leave } from "../models/Leave.js";
import { eachDayInMonth, formatDateKey, isSunday, monthRange } from "../utils/date.js";

const GLOBAL_LOCATIONS = ["All", "ALL", "Global", "GLOBAL"];

export async function buildCalendar(user, month, year) {
  const { start, end } = monthRange(month, year);
  const holidays = await Holiday.find({
    date: { $gte: start, $lte: end },
    location: { $in: [user.location, ...GLOBAL_LOCATIONS] }
  }).sort({ date: 1 });
  const leaves = await Leave.find({
    user: user._id,
    date: { $gte: start, $lte: end },
    status: "APPROVED"
  }).sort({ date: 1 });

  const holidayByDate = new Map(holidays.map((holiday) => [formatDateKey(holiday.date), holiday]));
  const leaveByDate = new Map(leaves.map((leave) => [formatDateKey(leave.date), leave]));

  return eachDayInMonth(month, year).map((date) => {
    const key = formatDateKey(date);
    const holiday = holidayByDate.get(key);
    const leave = leaveByDate.get(key);

    if (holiday) {
      return {
        date: key,
        code: "H",
        label: holiday.name,
        meta: holiday.occasion
      };
    }

    if (leave) {
      return {
        date: key,
        code: leave.leaveType === "LOP" ? "LOP" : "L",
        label: leave.leaveType === "LOP" ? "Loss of Pay" : "Leave",
        meta: leave.duration
      };
    }

    if (isSunday(date)) {
      return {
        date: key,
        code: "W",
        label: "Sunday",
        meta: "Weekly off"
      };
    }

    return {
      date: key,
      code: "P",
      label: "Present",
      meta: "Working day"
    };
  });
}
