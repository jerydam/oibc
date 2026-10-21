"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import Avatar from "@/components/Avatar";
import type { Member } from "@/lib/types";

export default function AdminMembers({ token }: { token: string }) {
  const api = adminApi(token);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = await api.members(q ? { search: q } : {});
      setMembers(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const STATUS_BADGE: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-600",
    pending: "bg-yellow-100 text-yellow-800",
    transferred: "bg-blue-100 text-blue-800",
    deceased: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Members</h1>
        <span className="text-sm text-gray-400">{members.length} records</span>
      </div>

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          placeholder="Search by name or member number…"
          className="flex-1 rounded border border-rule px-3 py-2 text-sm" />
        <button onClick={() => load(search)}
          className="rounded bg-ink text-white px-4 py-2 text-sm">Search</button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg border border-rule overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule bg-mist text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 hidden md:table-cell">Member #</th>
                <th className="px-4 py-3 hidden lg:table-cell">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-rule last:border-0 hover:bg-mist/50">
                  <td className="px-3 py-2">
                    <Avatar name={m.preferred_display_name} path={m.profile_photo_path} size={36} />
                  </td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-ink">{m.full_name}</p>
                    <p className="text-xs text-gray-400">{m.preferred_display_name}</p>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell text-gray-500">{m.member_number}</td>
                  <td className="px-4 py-2 hidden lg:table-cell text-gray-500">{m.email}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${STATUS_BADGE[m.membership_status] ?? "bg-gray-100 text-gray-600"}`}>
                      {m.membership_status}
                    </span>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
