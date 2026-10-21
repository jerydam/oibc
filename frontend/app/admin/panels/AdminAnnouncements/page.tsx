"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminAnnouncements({ token }: { token: string }) {
  const api = adminApi(token);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = { title:"", body:"", target_audience:"public", expires_at:"", status:"draft" };
  const [form, setForm] = useState(blank);
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const load = () => {
    setLoading(true);
    api.announcementList().then(setList).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  function openEdit(a: any) {
    setEditing(a);
    setForm({ title: a.title, body: a.body,
      target_audience: a.target_audience ?? "public",
      expires_at: a.expires_at ? a.expires_at.slice(0,10) : "",
      status: a.status ?? "draft" });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, expires_at: form.expires_at || undefined };
    try {
      if (editing) await api.updateAnnouncement(editing.id, payload);
      else await api.createAnnouncement(payload);
      setShowForm(false); setEditing(null); setForm(blank); load();
    } finally { setSaving(false); }
  }

  async function togglePublish(a: any) {
    const newStatus = a.status === "published" ? "draft" : "published";
    await api.updateAnnouncement(a.id, { status: newStatus });
    load();
  }

  const BADGE: Record<string,string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    expired: "bg-gray-100 text-gray-500",
    archived: "bg-gray-100 text-gray-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Announcements</h1>
        <button onClick={() => { setEditing(null); setForm(blank); setShowForm(!showForm); }}
          className="rounded bg-ink text-white px-4 py-2 text-sm">
          {showForm && !editing ? "Cancel" : "+ New Announcement"}
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
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-ink mb-1">Body *</label>
            <textarea required rows={5} value={form.body} onChange={set("body")}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Audience</label>
            <select value={form.target_audience} onChange={set("target_audience")}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              <option value="public">Public</option>
              <option value="members">Members</option>
              <option value="leadership">Leadership</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Expires (optional)</label>
            <input type="date" value={form.expires_at} onChange={set("expires_at")}
              className="w-full rounded border border-rule px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Status</label>
            <select value={form.status} onChange={set("status")}
              className="w-full rounded border border-rule px-3 py-2 text-sm bg-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded border border-rule px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded bg-ink text-white px-6 py-2 text-sm disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <div key={a.id}
              className="bg-white border border-rule rounded-lg p-4 flex gap-3 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink">{a.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${BADGE[a.status] ?? "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                  <span className="text-xs text-gray-400">{a.target_audience}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(a.created_at).toLocaleDateString("en-NG")}
                  {a.expires_at && ` · expires ${new Date(a.expires_at).toLocaleDateString("en-NG")}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(a)}
                  className="text-xs rounded border border-rule px-3 py-1.5">Edit</button>
                <button onClick={() => togglePublish(a)}
                  className={`text-xs rounded px-3 py-1.5 ${
                    a.status === "published" ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"}`}>
                  {a.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-12 text-gray-400">No announcements yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
