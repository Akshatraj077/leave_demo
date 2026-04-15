import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format.js";

export function LeaveHistoryPage() {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myLeaves()
      .then((payload) => {
        setLeaves(payload.leaves);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Leave lifecycle</p>
        <h2 className="text-2xl font-bold">Leave history</h2>
      </div>

      {error ? <p className="rounded-lg border border-rose/40 bg-rose/10 p-4 text-rose">{error}</p> : null}
      {loading ? <p className="text-slate-400">Loading leave history...</p> : null}
      {!loading && !leaves.length ? <EmptyState title="No leave history" message="Submitted requests will appear here." /> : null}
      {leaves.length ? (
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Financial Year</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{formatDate(leave.date)}</td>
                  <td><StatusBadge value={leave.leaveType} /></td>
                  <td>{leave.duration}</td>
                  <td><StatusBadge value={leave.status} /></td>
                  <td>{leave.financialYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
