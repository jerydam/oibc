"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import type { Activity } from "@/lib/types";

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  draft:     "bg-gray-100 text-gray-500",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const BLANK = {
  title: "", start_at: "", end_at: "", venue: "", description: "",
  occurrence_status: "scheduled",
};

export default function AdminActivities({ token }: { token: string }) {
  const api = adminApi(token);
  const [acts, setActs]   = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]   = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [err, setErr]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.activities().then(setActs).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const series = await api.createSeries({ title: form.title, visibility: "public" });
      await api.createOccurrence({
        activity_id: series.id,
        start_at: form.start_at,
        end_at: form.end_at || undefined,
        venue: form.venue || undefined,
        description: form.description || undefined,
        occurrence_status: form.occurrence_status,
      });
      setShowForm(false);
      setForm(BLANK);
      load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to create activity.");
    }
    setSaving(false);
  }

  async function publish(id: string) {
    await api.publishOccurrence(id);
    load();
  }

  async function setStatus(id: string, status: string) {
    await api.updateOccurrence(id, { occurrence_status: status });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Activities</h1>
        <button onClick={() => { setShowForm(!showForm); setErr(null); }}
          className="rounded bg-ink text-white px-4 py-2 text-sm">
          {showForm ? "Cancel" : "+ New Activity"}
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {err}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate}
          className="bg-white border border-rule rounded-lg p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Title *</label>
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Start *</label>
            <input type="datetime-local" required value={form.start_at}
              onChange={(e) => setForm({ ...form, start_at: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">End</label>
            <input type="datetime-local" value={form.end_at}
              onChange={(e) => setForm({ ...form, end_at: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Venue</label>
            <input value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status</label>
            <select value={form.occurrence_status}
              onChange={(e) => setForm({ ...form, occurrence_status: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Description</label>
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving}
              className="rounded bg-ink text-white px-6 py-2 text-sm disabled:opacity-60">
              {saving ? "Saving…" : "Create Activity"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-3">
          {acts.map((a) => (
            <div key={a.id}
              className="bg-white border border-rule rounded-lg p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink">{a.activity_title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${STATUS_BADGE[a.occurrence_status] ?? "bg-gray-100 text-gray-500"}`}>
                    {a.occurrence_status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(a.start_at).toLocaleString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                  {a.venue && ` · ${a.venue}`}
                  {a.department && ` · ${a.department}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 items-start flex-wrap">
                {a.occurrence_status !== "published" && a.occurrence_status !== "cancelled" && (
                  <button onClick={() => publish(a.id)}
                    className="text-xs rounded bg-green-600 text-white px-3 py-1.5">Publish</button>
                )}
                {a.occurrence_status !== "completed" && a.occurrence_status !== "cancelled" && (
                  <button onClick={() => setStatus(a.id, "completed")}
                    className="text-xs rounded border border-gray-300 text-gray-600 px-3 py-1.5">Complete</button>
                )}
                {a.occurrence_status !== "cancelled" && (
                  <button onClick={() => setStatus(a.id, "cancelled")}
                    className="text-xs rounded border border-red-300 text-red-600 px-3 py-1.5">Cancel</button>
                )}
              </div>
            </div>
          ))}
          {acts.length === 0 && (
            <div className="text-center py-12 text-gray-500">No activities yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
