import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { EmptyState } from "../components/EmptyState.jsx";
import { FormField, inputClass } from "../components/FormField.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate, toInputDate } from "../utils/format.js";

const blankEmployee = {
  name: "",
  email: "",
  companyId: "",
  password: "Employee@123",
  employmentStatus: "ACTIVE",
  joiningDate: "",
  dateOfBirth: "",
  panNumber: "",
  bankAccountNumber: "",
  bankName: "",
  ifscCode: "",
  accountHolderName: "",
  location: "Kolkata",
  totalLeaves: 12
};

const blankHoliday = {
  name: "",
  date: "",
  occasion: "",
  location: "Kolkata"
};

export function AdminPanelPage() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [employeeForm, setEmployeeForm] = useState(blankEmployee);
  const [editingEmployeeId, setEditingEmployeeId] = useState("");
  const [holidayForm, setHolidayForm] = useState(blankHoliday);
  const [editingHolidayId, setEditingHolidayId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [employeePayload, leavePayload, holidayPayload] = await Promise.all([
      api.employees(),
      api.pendingLeaves(),
      api.holidays()
    ]);
    setEmployees(employeePayload.employees);
    setPendingLeaves(leavePayload.leaves);
    setHolidays(holidayPayload.holidays);
  }

  useEffect(() => {
    loadAll().catch((err) => setError(err.message));
  }, []);

  const tabs = useMemo(
    () => [
      ["employees", "Employees"],
      ["requests", `Requests (${pendingLeaves.length})`],
      ["holidays", "Holidays"]
    ],
    [pendingLeaves.length]
  );

  function updateEmployee(field, value) {
    const upperFields = ["companyId", "panNumber", "ifscCode"];
    setEmployeeForm((current) => ({
      ...current,
      [field]: upperFields.includes(field) ? value.toUpperCase() : value
    }));
  }

  function updateHoliday(field, value) {
    setHolidayForm((current) => ({ ...current, [field]: value }));
  }

  function editEmployee(employee) {
    setEditingEmployeeId(employee.id);
    setEmployeeForm({
      name: employee.name || "",
      email: employee.email || "",
      companyId: employee.companyId || "",
      password: "",
      employmentStatus: employee.employmentStatus || "ACTIVE",
      joiningDate: toInputDate(employee.joiningDate),
      dateOfBirth: toInputDate(employee.dateOfBirth),
      panNumber: employee.panNumber || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      bankName: employee.bankName || "",
      ifscCode: employee.ifscCode || "",
      accountHolderName: employee.accountHolderName || "",
      location: employee.location || "Kolkata",
      totalLeaves: employee.leaveBalance?.totalLeaves || 12
    });
    setTab("employees");
  }

  function resetEmployeeForm() {
    setEditingEmployeeId("");
    setEmployeeForm(blankEmployee);
  }

  async function saveEmployee(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body = { ...employeeForm, totalLeaves: Number(employeeForm.totalLeaves) };
      if (!body.password) {
        delete body.password;
      }
      if (editingEmployeeId) {
        await api.updateEmployee(editingEmployeeId, body);
        setMessage("Employee updated.");
      } else {
        await api.createEmployee(body);
        setMessage("Employee added.");
      }
      resetEmployeeForm();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editHoliday(holiday) {
    setEditingHolidayId(holiday.id);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      occasion: holiday.occasion,
      location: holiday.location
    });
    setTab("holidays");
  }

  function resetHolidayForm() {
    setEditingHolidayId("");
    setHolidayForm(blankHoliday);
  }

  async function saveHoliday(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingHolidayId) {
        await api.updateHoliday(editingHolidayId, holidayForm);
        setMessage("Holiday updated.");
      } else {
        await api.createHoliday(holidayForm);
        setMessage("Holiday added.");
      }
      resetHolidayForm();
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function decideLeave(id, action) {
    setError("");
    setMessage("");
    try {
      if (action === "approve") {
        await api.approveLeave(id);
        setMessage("Leave approved.");
      } else {
        await api.rejectLeave(id);
        setMessage("Leave rejected.");
      }
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteHoliday(id) {
    setError("");
    setMessage("");
    try {
      await api.deleteHoliday(id);
      setMessage("Holiday deleted.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Admin controls</p>
        <h2 className="text-2xl font-bold">Admin panel</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <button key={key} className={`rounded-md border px-4 py-2 text-sm font-semibold ${tab === key ? "border-sky bg-sky/10 text-sky" : "border-line text-slate-400"}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="rounded-lg border border-rose/40 bg-rose/10 p-4 text-rose">{error}</p> : null}
      {message ? <p className="rounded-lg border border-mint/40 bg-mint/10 p-4 text-mint">{message}</p> : null}

      {tab === "employees" ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={saveEmployee}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{editingEmployeeId ? "Edit employee" : "Add employee"}</h3>
              {editingEmployeeId ? <button type="button" className="secondary-btn" onClick={resetEmployeeForm}>Clear</button> : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Name">
                <input className={inputClass} value={employeeForm.name} onChange={(event) => updateEmployee("name", event.target.value)} />
              </FormField>
              <FormField label="Email">
                <input className={inputClass} type="email" value={employeeForm.email} onChange={(event) => updateEmployee("email", event.target.value)} />
              </FormField>
              <FormField label="Company ID">
                <input className={inputClass} value={employeeForm.companyId} onChange={(event) => updateEmployee("companyId", event.target.value)} />
              </FormField>
              <FormField label="Password">
                <input className={inputClass} type="password" value={employeeForm.password} onChange={(event) => updateEmployee("password", event.target.value)} placeholder={editingEmployeeId ? "Leave blank to keep" : ""} />
              </FormField>
              <FormField label="Employment status">
                <select className={inputClass} value={employeeForm.employmentStatus} onChange={(event) => updateEmployee("employmentStatus", event.target.value)}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PROBATION">PROBATION</option>
                  <option value="NOTICE_PERIOD">NOTICE PERIOD</option>
                </select>
              </FormField>
              <FormField label="Leave quota">
                <input className={inputClass} type="number" min="0" step="0.5" value={employeeForm.totalLeaves} onChange={(event) => updateEmployee("totalLeaves", event.target.value)} />
              </FormField>
              <FormField label="Joining date">
                <input className={inputClass} type="date" value={employeeForm.joiningDate} onChange={(event) => updateEmployee("joiningDate", event.target.value)} />
              </FormField>
              <FormField label="Date of birth">
                <input className={inputClass} type="date" value={employeeForm.dateOfBirth} onChange={(event) => updateEmployee("dateOfBirth", event.target.value)} />
              </FormField>
              <FormField label="PAN">
                <input className={inputClass} value={employeeForm.panNumber} onChange={(event) => updateEmployee("panNumber", event.target.value)} />
              </FormField>
              <FormField label="Account number">
                <input className={inputClass} value={employeeForm.bankAccountNumber} onChange={(event) => updateEmployee("bankAccountNumber", event.target.value)} />
              </FormField>
              <FormField label="Bank name">
                <input className={inputClass} value={employeeForm.bankName} onChange={(event) => updateEmployee("bankName", event.target.value)} />
              </FormField>
              <FormField label="IFSC">
                <input className={inputClass} value={employeeForm.ifscCode} onChange={(event) => updateEmployee("ifscCode", event.target.value)} />
              </FormField>
              <FormField label="Account holder">
                <input className={inputClass} value={employeeForm.accountHolderName} onChange={(event) => updateEmployee("accountHolderName", event.target.value)} />
              </FormField>
              <FormField label="Location">
                <input className={inputClass} value={employeeForm.location} onChange={(event) => updateEmployee("location", event.target.value)} />
              </FormField>
            </div>
            <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : editingEmployeeId ? "Update employee" : "Add employee"}</button>
          </form>

          <section>
            <h3 className="mb-4 text-lg font-semibold">Employees</h3>
            {employees.length ? (
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company ID</th>
                      <th>Status</th>
                      <th>Quota</th>
                      <th>Remaining</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.companyId}</td>
                        <td><StatusBadge value={employee.employmentStatus} /></td>
                        <td>{employee.leaveBalance?.totalLeaves}</td>
                        <td>{employee.leaveBalance?.remainingLeaves}</td>
                        <td><button className="secondary-btn" onClick={() => editEmployee(employee)}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No employees" message="Add employees to start using leave workflows." />
            )}
          </section>
        </div>
      ) : null}

      {tab === "requests" ? (
        <section>
          <h3 className="mb-4 text-lg font-semibold">Pending leave requests</h3>
          {pendingLeaves.length ? (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>{leave.user?.name}</td>
                      <td>{formatDate(leave.date)}</td>
                      <td><StatusBadge value={leave.leaveType} /></td>
                      <td>{leave.duration}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button className="primary-btn" onClick={() => decideLeave(leave.id, "approve")}>Approve</button>
                          <button className="danger-btn" onClick={() => decideLeave(leave.id, "reject")}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No pending requests" message="Applied leaves will wait here for approval." />
          )}
        </section>
      ) : null}

      {tab === "holidays" ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <form className="space-y-4 rounded-lg border border-line bg-panel p-5" onSubmit={saveHoliday}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{editingHolidayId ? "Edit holiday" : "Add holiday"}</h3>
              {editingHolidayId ? <button type="button" className="secondary-btn" onClick={resetHolidayForm}>Clear</button> : null}
            </div>
            <FormField label="Name">
              <input className={inputClass} value={holidayForm.name} onChange={(event) => updateHoliday("name", event.target.value)} />
            </FormField>
            <FormField label="Date">
              <input className={inputClass} type="date" value={holidayForm.date} onChange={(event) => updateHoliday("date", event.target.value)} />
            </FormField>
            <FormField label="Occasion">
              <input className={inputClass} value={holidayForm.occasion} onChange={(event) => updateHoliday("occasion", event.target.value)} />
            </FormField>
            <FormField label="Location">
              <input className={inputClass} value={holidayForm.location} onChange={(event) => updateHoliday("location", event.target.value)} />
            </FormField>
            <button className="primary-btn" disabled={saving}>{saving ? "Saving..." : editingHolidayId ? "Update holiday" : "Add holiday"}</button>
          </form>

          <section>
            <h3 className="mb-4 text-lg font-semibold">Holiday list</h3>
            {holidays.length ? (
              <div className="table-shell">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map((holiday) => (
                      <tr key={holiday.id}>
                        <td>{holiday.name}</td>
                        <td>{formatDate(holiday.date)}</td>
                        <td>{holiday.day}</td>
                        <td>{holiday.location}</td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <button className="secondary-btn" onClick={() => editHoliday(holiday)}>Edit</button>
                            <button className="danger-btn" onClick={() => deleteHoliday(holiday.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No holidays" message="Add holiday dates before employees apply leave." />
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
