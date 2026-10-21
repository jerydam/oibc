"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminDepartments({ token }: { token: string }) {
  const api = adminApi(token);
  const [depts, setDepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", description:"", meeting_schedule:"" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.departmentList().then(setDepts).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/departments?name=${encodeURIComponent(form.name)}${form.description ? `&description=${encodeURIComponent(form.description)}` : ""}${form.meeting_schedule ? `&meeting_schedule=${encodeURIComponent(form.meeting_schedule)}` : ""}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setForm({ name:"", description:"", meeting_schedule:"" });
      load();
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Departments</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded bg-ink text-white px-4 py-2 text-sm">
          {showForm ? "Cancel" : "+ New Department"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate}
          className="bg-white border border-rule rounded-lg p-5 mb-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Name *</label>
            <input required value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Meeting Schedule</label>
            <input value={form.meeting_schedule}
              onChange={e => setForm({...form, meeting_schedule: e.target.value})}
              placeholder="e.g. Every Saturday 10am"
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Description</label>
            <textarea rows={2} value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="rounded bg-ink text-white px-6 py-2 text-sm disabled:opacity-60">
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {depts.map((d) => (
            <div key={d.id} className="bg-white border border-rule rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-ink">{d.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  d.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {d.status}
                </span>
              </div>
              {d.description && <p className="text-xs text-gray-500 mb-2">{d.description}</p>}
              {d.leader_name && <p className="text-xs text-gray-400">Leader: {d.leader_name}</p>}
              {d.meeting_schedule && <p className="text-xs text-gray-400">{d.meeting_schedule}</p>}
              <p className="text-xs text-dusk mt-2">{d.member_count} member{d.member_count !== 1 ? "s" : ""}</p>
            </div>
          ))}
          {depts.length === 0 && (
            <p className="text-gray-400 col-span-3 text-center py-8">No departments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}