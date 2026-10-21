"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminSermons({ token }: { token: string }) {
  const api = adminApi(token);
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { title:"", preacher_name:"", sermon_date:"", scripture_reference:"",
    category:"", description:"", video_url:"", audio_url:"", publication_status:"draft" };
  const [form, setForm] = useState(blank);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const load = () => {
    setLoading(true);
    api.sermonList().then(setSermons).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function openEdit(s: any) {
    setEditing(s);
    setForm({ title: s.title, preacher_name: s.preacher_name ?? "",
      sermon_date: s.sermon_date ?? "", scripture_reference: s.scripture_reference ?? "",
      category: s.category ?? "", description: s.description ?? "",
      video_url: s.video_url ?? "", audio_url: s.audio_url ?? "",
      publication_status: s.publication_status ?? "draft" });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.updateSermon(editing.id, form);
      else await api.createSermon(form);
      setShowForm(false);
      setEditing(null);
      setForm(blank);
      load();
    } finally { setSaving(false); }
  }

  async function archive(id: string) {
    if (!confirm("Archive this sermon?")) return;
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/sermons/${id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Sermons</h1>
        <button onClick={() => { setEditing(null); setForm(blank); setShowForm(!showForm); }}
          className="rounded bg-ink text-white px-4 py-2 text-sm">
          {showForm && !editing ? "Cancel" : "+ New Sermon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave}
          className="bg-white border border-rule rounded-lg p-6 mb-6 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Title *</label>
            <input required value={form.title} onChange={set("title")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Preacher</label>
            <input value={form.preacher_name} onChange={set("preacher_name")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Date</label>
            <input type="date" value={form.sermon_date} onChange={set("sermon_date")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Scripture</label>
            <input value={form.scripture_reference} onChange={set("scripture_reference")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Category</label>
            <input value={form.category} onChange={set("category")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Video URL</label>
            <input value={form.video_url} onChange={set("video_url")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Audio URL</label>
            <input value={form.audio_url} onChange={set("audio_url")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status</label>
            <select value={form.publication_status} onChange={set("publication_status")}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={set("description")}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded border border-rule px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded bg-ink text-white px-6 py-2 text-sm disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Sermon"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-3">
          {sermons.map((s) => (
            <div key={s.id}
              className="bg-white border border-rule rounded-lg p-4 flex gap-3 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink">{s.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.publication_status === "published" ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-500"}`}>{s.publication_status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {s.preacher_name}{s.sermon_date && ` · ${new Date(s.sermon_date).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}`}
                  {s.scripture_reference && ` · ${s.scripture_reference}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(s)}
                  className="text-xs rounded border border-rule px-3 py-1.5">Edit</button>
                <button onClick={() => archive(s.id)}
                  className="text-xs rounded border border-rule text-gray-500 px-3 py-1.5">Archive</button>
              </div>
            </div>
          ))}
          {sermons.length === 0 && (
            <div className="text-center py-12 text-gray-500">No sermons yet.</div>
          )}
        </div>
      )}
    </div>
  );
}