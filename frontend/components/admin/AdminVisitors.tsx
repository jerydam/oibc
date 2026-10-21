
"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

const STATUSES = ["new","contacted","converted","closed","no_response"];
const BADGE: Record<string,string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  converted: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-500",
  no_response: "bg-red-100 text-red-600",
};

export default function AdminVisitors({ token }: { token: string }) {
  const api = adminApi(token);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    setLoading(true);
    api.visitors(filterStatus || undefined).then(setVisitors).finally(() => setLoading(false));
  };
  useEffect(load, [token, filterStatus]);

  async function updateStatus(id: string, status: string) {
    await api.updateVisitorStatus(id, status);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Visitors</h1>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded border border-rule bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : (
        <div className="space-y-3">
          {visitors.map((v) => (
            <div key={v.id}
              className="bg-white border border-rule rounded-lg p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-ink">{v.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${BADGE[v.follow_up_status] ?? "bg-gray-100"}`}>
                    {v.follow_up_status.replace("_"," ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {v.email || v.phone || "No contact info"}
                  {v.service_attended && ` · ${v.service_attended}`}
                  {` · ${new Date(v.created_at).toLocaleDateString("en-NG")}`}
                </p>
              </div>
              <select value={v.follow_up_status}
                onChange={e => updateStatus(v.id, e.target.value)}
                className="rounded border border-rule bg-white px-2 py-1 text-xs shrink-0">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
          ))}
          {visitors.length === 0 && (
            <div className="text-center py-12 text-gray-500">No visitors found.</div>
          )}
        </div>
      )}
    </div>
  );
}
