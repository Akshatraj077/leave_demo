import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { CalendarGrid } from "../components/CalendarGrid.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { currentMonthParams, formatDate, moneylessNumber } from "../utils/format.js";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    const { month, year } = currentMonthParams();
    try {
      const payload = await api.dashboard(`?month=${month}&year=${year}`);
      setDashboard(payload.dashboard);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return <p className="rounded-lg border border-rose/40 bg-rose/10 p-4 text-rose">{error}</p>;
  }

  if (!dashboard) {
    return <p className="text-slate-400">Loading dashboard...</p>;
  }

  if (dashboard.role === "ADMIN") {
    const summary = dashboard.summary;
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">Admin overview</p>
          <h2 className="text-2xl font-bold">People, requests, and leave usage</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Employees" value={summary.employeeCount} tone="sky" helper={`${summary.activeCount} active`} />
          <MetricCard label="Pending Requests" value={summary.pendingCount} tone="gold" helper="Awaiting review" />
          <MetricCard label="Used Leaves" value={moneylessNumber(summary.totalUsed)} tone="mint" helper={summary.financialYear} />
          <MetricCard label="Remaining Leaves" value={moneylessNumber(summary.totalRemaining)} tone="rose" helper="Across employees" />
        </div>
        <section className="rounded-lg border border-line bg-panel p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Recent pending requests</h3>
            <StatusBadge value="APPLIED" />
          </div>
          {dashboard.pendingLeaves.length ? (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.user?.name}</td>
                      <td>{formatDate(leave.date)}</td>
                      <td><StatusBadge value={leave.leaveType} /></td>
                      <td>{leave.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No pending leaves" message="New employee requests will appear here." />
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Employee dashboard</p>
        <h2 className="text-2xl font-bold">Welcome back, {dashboard.profile.name}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Leaves" value={moneylessNumber(dashboard.balance.totalLeaves)} tone="sky" helper={dashboard.balance.financialYear} />
        <MetricCard label="Used Leaves" value={moneylessNumber(dashboard.balance.usedLeaves)} tone="mint" helper="Approved CL" />
        <MetricCard label="Remaining Leaves" value={moneylessNumber(dashboard.balance.remainingLeaves)} tone="gold" helper={`${moneylessNumber(dashboard.balance.reservedLeaves)} reserved`} />
        <MetricCard label="Employment Status" value={dashboard.profile.employmentStatus.replace("_", " ")} tone={dashboard.profile.employmentStatus === "NOTICE_PERIOD" ? "rose" : "mint"} helper={dashboard.profile.location} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section>
          <h3 className="mb-4 text-lg font-semibold">Upcoming holidays</h3>
          <div className="space-y-3">
            {dashboard.upcomingHolidays.length ? (
              dashboard.upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="rounded-lg border border-line bg-panel p-3">
                  <p className="font-semibold text-slate-100">{holiday.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{formatDate(holiday.date)} - {holiday.location}</p>
                </div>
              ))
            ) : (
              <EmptyState title="No holidays ahead" message="The holiday calendar is clear for now." />
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Monthly calendar</h3>
            <p className="text-sm text-slate-500">H, L, LOP, W, P</p>
          </div>
          <CalendarGrid days={dashboard.calendar} />
        </section>
      </div>

      <section className="rounded-lg border border-line bg-panel p-4">
        <h3 className="mb-4 text-lg font-semibold">Recent leave history</h3>
        {dashboard.recentLeaves.length ? (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{formatDate(leave.date)}</td>
                    <td><StatusBadge value={leave.leaveType} /></td>
                    <td>{leave.duration}</td>
                    <td><StatusBadge value={leave.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No leave requests" message="Apply for leave to start a history." />
        )}
      </section>
    </div>
  );
}
