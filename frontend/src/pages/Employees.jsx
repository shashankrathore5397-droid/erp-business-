import { Filter, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getApiError } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { compactDate, currency } from "../format.js";
import { useToast } from "../state/ToastContext.jsx";

const emptyEmployee = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "operations",
  designation: "",
  hire_date: "",
  salary: "0.00",
  status: "active",
};

const departments = ["operations", "sales", "hr", "finance", "engineering"];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyEmployee);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { pushToast } = useToast();

  async function loadEmployees() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/employees/");
      setEmployees(response.data);
      setPage(1);
    } catch (apiError) {
      setError(getApiError(apiError, "Employees could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/employees/", form);
      setForm(emptyEmployee);
      await loadEmployees();
      pushToast({ type: "success", message: "Employee added." });
    } catch (apiError) {
      setError(getApiError(apiError, "Employee could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employee) {
    setError("");
    try {
      await api.delete(`/employees/${employee.id}/`);
      setEmployees((current) => current.filter((item) => item.id !== employee.id));
      pushToast({ type: "success", message: "Employee removed." });
    } catch (apiError) {
      setError(getApiError(apiError, "Employee could not be deleted."));
    }
  }

  const filtered = employees.filter((employee) => {
    const haystack = `${employee.full_name} ${employee.employee_code} ${employee.department}`
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedEmployees = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Employees"
        action={
          <button
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-ocean-500 hover:text-ocean-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            onClick={loadEmployees}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add employee</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Onboard new team members</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Code
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.employee_code}
              onChange={(event) => setForm({ ...form, employee_code: event.target.value })}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            First name
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.first_name}
              onChange={(event) => setForm({ ...form, first_name: event.target.value })}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Last name
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.last_name}
              onChange={(event) => setForm({ ...form, last_name: event.target.value })}
              required
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Email
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Phone
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Department
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Designation
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.designation}
              onChange={(event) => setForm({ ...form, designation: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hire date
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.hire_date}
              onChange={(event) => setForm({ ...form, hire_date: event.target.value })}
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Salary
            <input
              min="0"
              step="0.01"
              type="number"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={form.salary}
              onChange={(event) => setForm({ ...form, salary: event.target.value })}
            />
          </label>
          <button
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-ocean-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-ocean-700"
            disabled={saving}
            type="submit"
          >
            <Plus size={17} aria-hidden="true" />
            {saving ? "Saving" : "Add employee"}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Employee directory</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {loading ? "Loading" : `${employees.length} people`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Search size={16} />
              <input
                className="bg-transparent text-sm outline-none"
                placeholder="Search employees"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title="No employees" body="Team members you add appear here." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Designation</th>
                  <th className="pb-3">Hire date</th>
                  <th className="pb-3">Salary</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pagedEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {employee.full_name}
                      </p>
                      <p className="text-xs text-slate-500">{employee.employee_code}</p>
                    </td>
                    <td className="py-4 capitalize text-slate-600 dark:text-slate-300">
                      {employee.department}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {employee.designation || "Not set"}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {compactDate(employee.hire_date)}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {currency(employee.salary)}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                        {employee.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        type="button"
                        title="Delete employee"
                        onClick={() => removeEmployee(employee)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
