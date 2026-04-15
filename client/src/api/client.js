const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    const detailText = payload.details
      ? Object.entries(payload.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")
      : "";
    const error = new Error(detailText ? `${payload.message}. ${detailText}` : payload.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  changePassword: (body) => request("/auth/change-password", { method: "PATCH", body }),
  dashboard: (params = "") => request(`/dashboard${params}`),
  calendar: (params = "") => request(`/calendar${params}`),
  profile: () => request("/profile"),
  updateProfile: (body) => request("/profile", { method: "PATCH", body }),
  applyLeave: (body) => request("/leaves/apply", { method: "POST", body }),
  myLeaves: () => request("/leaves/my-history"),
  pendingLeaves: () => request("/leaves/pending"),
  approveLeave: (id) => request(`/leaves/${id}/approve`, { method: "PATCH" }),
  rejectLeave: (id) => request(`/leaves/${id}/reject`, { method: "PATCH" }),
  employees: () => request("/employees"),
  createEmployee: (body) => request("/employees", { method: "POST", body }),
  updateEmployee: (id, body) => request(`/employees/${id}`, { method: "PATCH", body }),
  holidays: () => request("/holidays"),
  createHoliday: (body) => request("/holidays", { method: "POST", body }),
  updateHoliday: (id, body) => request(`/holidays/${id}`, { method: "PATCH", body }),
  deleteHoliday: (id) => request(`/holidays/${id}`, { method: "DELETE" })
};
