
"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";

export default function AdminRegistrations({ token }: { token: string }) {
  const api = adminApi(token);
  const [regs, setRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.pendingRegistrations().then(setRegs).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  async function approve(id: string) {
    await api.approveRegistration(id);
    load();
  }
  async function reject(id: string) {
    const reason = prompt("Reason for rejection (optional):");
    await api.rejectRegistration(id, reason ?? "");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Pending Registrations</h1>
      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : regs.length === 0 ? (
        <div className="bg-white border border-rule rounded-lg p-8 text-center text-gray-500">
          No pending registrations.
        </div>
      ) : (
        <div className="space-y-4">
          {regs.map((r) => (
            <div key={r.id}
              className="bg-white border border-rule rounded-lg p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="font-medium text-ink">{r.full_name}</p>
                <p className="text-sm text-gray-500">{r.email || r.phone}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted {new Date(r.submitted_at).toLocaleDateString("en-NG")}
                </p>
                {r.message && <p className="text-sm text-gray-600 mt-2">{r.message}</p>}
              </div>
              <div className="flex gap-3 items-start shrink-0">
                <button onClick={() => approve(r.id)}
                  className="rounded bg-green-600 text-white px-4 py-1.5 text-sm">Approve</button>
                <button onClick={() => reject(r.id)}
                  className="rounded bg-red-600 text-white px-4 py-1.5 text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}