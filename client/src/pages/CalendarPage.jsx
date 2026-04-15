import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { CalendarGrid } from "../components/CalendarGrid.jsx";
import { FormField, inputClass } from "../components/FormField.jsx";
import { currentMonthParams } from "../utils/format.js";

const legend = [
  ["H", "Holiday"],
  ["L", "Approved leave"],
  ["LOP", "Loss of Pay"],
  ["W", "Sunday"],
  ["P", "Present"]
];

export function CalendarPage() {
  const initial = currentMonthParams();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [employees, setEmployees] = useState([]);
  const [userId, setUserId] = useState("");
  const [calendar, setCalendar] = useState([]);
  const [error, setError] = useState("");

  async function loadCalendar() {
    try {
      const userParam = userId ? `&userId=${userId}` : "";
      const payload = await api.calendar(`?month=${month}&year=${year}${userParam}`);
      setCalendar(payload.calendar);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    api.employees().then((payload) => setEmployees(payload.employees)).catch(() => setEmployees([]));
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [month, year, userId]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Priority: Holiday, Approved Leave, Sunday, Present</p>
        <h2 className="text-2xl font-bold">Monthly calendar</h2>
      </div>

      <div className="grid gap-4 rounded-lg border border-line bg-panel p-4 md:grid-cols-3">
        <FormField label="Month">
          <select className={inputClass} value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Year">
          <input className={inputClass} type="number" min="2020" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} />
        </FormField>
        {employees.length ? (
          <FormField label="Employee calendar">
            <select className={inputClass} value={userId} onChange={(event) => setUserId(event.target.value)}>
              <option value="">My calendar</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          </FormField>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {legend.map(([code, label]) => (
          <span key={code} className="rounded-md border border-line bg-panel px-3 py-2 text-sm text-slate-300">
            <strong className="text-sky">{code}</strong> {label}
          </span>
        ))}
      </div>

      {error ? <p className="rounded-lg border border-rose/40 bg-rose/10 p-4 text-rose">{error}</p> : null}
      <CalendarGrid days={calendar} />
    </div>
  );
}
