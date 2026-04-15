export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDateKey(value) {
  const date = normalizeDate(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

export function getFinancialYear(value = new Date()) {
  const date = normalizeDate(value) ?? new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function isSunday(value) {
  const date = normalizeDate(value);
  return Boolean(date && date.getUTCDay() === 0);
}

export function getDayName(value) {
  const date = normalizeDate(value);
  if (!date) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC"
  }).format(date);
}

export function durationToAmount(duration) {
  return duration === "HALF" ? 0.5 : 1;
}

export function monthRange(month, year) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start, end };
}

export function eachDayInMonth(month, year) {
  const { start, end } = monthRange(month, year);
  const days = [];
  for (let time = start.getTime(); time <= end.getTime(); time += MS_PER_DAY) {
    days.push(new Date(time));
  }
  return days;
}
