"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { adminApi } from "@/lib/api";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function AdminMonthlyWordInner({ token }: { token: string }) {
  const api = adminApi(token);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const today = new Date();

  const blankForm = {
    month: today.getMonth() + 1, year: today.getFullYear(),
    title: "", pastor_name: "", video_url: "", message_description: "",
    prayer_focus: "", scripture_reference: "", prayer_points_raw: "",
    publication_status: "draft",
  };
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.monthlyWordList().then(setList).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function openEdit(ed: any) {
    setEditing(ed);
    setForm({
      month: ed.month, year: ed.year, title: ed.title,
      pastor_name: ed.pastor_name ?? "", video_url: ed.video_url ?? "",
      message_description: ed.message_description ?? "",
      prayer_focus: ed.prayer_focus ?? "",
      scripture_reference: ed.scripture_reference ?? "",
      prayer_points_raw: (ed.prayer_points ?? []).join("\n"),
      publication_status: ed.publication_status ?? "draft",
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      prayer_points: form.prayer_points_raw.split("\n").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.updateMonthlyWord(editing.id, payload);
      } else {
        await api.createMonthlyWord(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(blankForm);
      load();
    } finally { setSaving(false); }
  }

  async function togglePublish(ed: any) {
    const newStatus = ed.publication_status === "published" ? "draft" : "published";
    await api.updateMonthlyWord(ed.id, { publication_status: newStatus });
    load();
  }

  const f = form;
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Monthly Word &amp; Prayer</h1>
        <button onClick={() => { setEditing(null); setForm(blankForm); setShowForm(!showForm); }}
          className="rounded bg-ink text-white px-4 py-2 text-sm">
          {showForm && !editing ? "Cancel" : "+ New Edition"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave}
          className="bg-white border border-rule rounded-lg p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Month</label>
            <select value={f.month} onChange={set("month")}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Year</label>
            <input type="number" value={f.year} onChange={set("year")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Theme / Title *</label>
            <input required value={f.title} onChange={set("title")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Pastor's Name</label>
            <input value={f.pastor_name} onChange={set("pastor_name")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Video URL (YouTube)</label>
            <input value={f.video_url} onChange={set("video_url")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Scripture Reference</label>
            <input value={f.scripture_reference} onChange={set("scripture_reference")}
              placeholder="e.g. Proverbs 3:5-6"
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Message Description</label>
            <textarea rows={3} value={f.message_description} onChange={set("message_description")}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Prayer Focus</label>
            <textarea rows={3} value={f.prayer_focus} onChange={set("prayer_focus")}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">
              Prayer Points (one per line)
            </label>
            <textarea rows={5} value={f.prayer_points_raw} onChange={set("prayer_points_raw")}
              placeholder={"Prayer for personal spiritual growth\nPrayer for families…"}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status</label>
            <select value={f.publication_status} onChange={set("publication_status")}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded border border-rule px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded bg-ink text-white px-6 py-2 text-sm disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Edition"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-3">
          {list.map((ed) => (
            <div key={ed.id}
              className="bg-white border border-rule rounded-lg p-4 flex flex-col sm:flex-row gap-3 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink">{ed.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    ed.publication_status === "published"
                      ? "bg-green-100 text-green-800"
                      : ed.publication_status === "archived"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>{ed.publication_status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {MONTHS[ed.month-1]} {ed.year}
                  {ed.pastor_name && ` · ${ed.pastor_name}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(ed)}
                  className="text-xs rounded border border-rule px-3 py-1.5">Edit</button>
                <button onClick={() => togglePublish(ed)}
                  className={`text-xs rounded px-3 py-1.5 ${
                    ed.publication_status === "published"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                  {ed.publication_status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-12 text-gray-400">No editions yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
export default function AdminMonthlyWord() {
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    getToken().then((t) => { setToken(t); setAuthReady(true); });
  }, []);
  if (!authReady) return <p className="text-gray-400 text-center py-12">Loading…</p>;
  if (!token) return <p className="text-red-500 text-center py-12">Not authenticated.</p>;
  return <AdminMonthlyWordInner token={token} />;
}
