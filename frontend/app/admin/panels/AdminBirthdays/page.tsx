"use client";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import Avatar from "@/components/Avatar";

type Celebrant = {
  id: string; display_name: string;
  photo_path: string | null; department: string | null; date: string | null;
};

type Overview = {
  today: Celebrant[];
  this_week: Celebrant[];
  this_month: Celebrant[];
  missing_birth_date: Array<{ id: string; member_number: string; full_name: string }>;
  consent_not_recorded: Array<{ id: string; member_number: string; full_name: string }>;
};

export default function AdminBirthdays({ token }: { token: string }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi(token).birthdayOverview()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 py-12 text-center">Loading…</p>;
  if (!data) return <p className="text-red-500 py-12 text-center">Failed to load birthday overview.</p>;

  const sections: [string, Celebrant[]][] = [
    ["Today", data.today],
    ["This Week", data.this_week],
    ["This Month", data.this_month],
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-ink">Birthday Management</h1>

      {sections.map(([label, items]) => (
        <section key={label}>
          <h2 className="font-semibold text-ink mb-3">
            {label}
            <span className="ml-2 text-xs font-normal text-gray-400">
              {items.length} celebrant{items.length !== 1 ? "s" : ""}
            </span>
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">No celebrants.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((c) => (
                <div key={c.id}
                  className="bg-white border border-rule rounded-lg p-4 flex items-center gap-3">
                  <Avatar name={c.display_name} path={c.photo_path} size={48} />
                  <div>
                    <p className="font-medium text-ink">{c.display_name}</p>
                    {c.department && <p className="text-xs text-gray-400">{c.department}</p>}
                    {c.date && (
                      <p className="text-xs text-gray-400">
                        {new Date(c.date).toLocaleDateString("en-NG", { day: "numeric", month: "long" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {data.missing_birth_date.length > 0 && (
        <section>
          <h2 className="font-semibold text-ink mb-3">
            Missing birth date
            <span className="ml-2 text-xs font-normal text-gray-400">
              {data.missing_birth_date.length} members
            </span>
          </h2>
          <div className="bg-white rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Member #</th>
                  <th className="px-4 py-3 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                {data.missing_birth_date.map((m) => (
                  <tr key={m.id} className="border-t border-rule">
                    <td className="px-4 py-3 text-gray-500">{m.member_number}</td>
                    <td className="px-4 py-3">{m.full_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data.consent_not_recorded.length > 0 && (
        <section>
          <h2 className="font-semibold text-ink mb-3">
            Consent not recorded
            <span className="ml-2 text-xs font-normal text-gray-400">
              {data.consent_not_recorded.length} members
            </span>
          </h2>
          <div className="bg-white rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Member #</th>
                  <th className="px-4 py-3 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                {data.consent_not_recorded.map((m) => (
                  <tr key={m.id} className="border-t border-rule">
                    <td className="px-4 py-3 text-gray-500">{m.member_number}</td>
                    <td className="px-4 py-3">{m.full_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
