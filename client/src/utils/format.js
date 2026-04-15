export function formatDate(value) {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function toInputDate(value) {
  if (!value) {
    return "";
  }
  return String(value).slice(0, 10);
}

export function currentMonthParams() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
}

export function moneylessNumber(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 1
  });
}
