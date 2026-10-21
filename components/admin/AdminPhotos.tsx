"use client";
import { useEffect, useState } from "react";
import { adminApi, photoUrl } from "@/lib/api";

type Submission = {
  id: string; member_id: string; full_name: string;
  file_path: string; status: string; submitted_at: string;
};

export default function AdminPhotos({ token }: { token: string }) {
  const api = adminApi(token);
  const [photos, setPhotos] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.pendingPhotos().then(setPhotos).finally(() => setLoading(false));
  };
  useEffect(load, [token]);

  async function review(id: string, approve: boolean) {
    const notes = approve ? undefined : (prompt("Notes for rejection (optional):") ?? undefined);
    await api.reviewPhoto(id, approve, notes);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Photo Approvals</h1>
      {loading ? (
        <p className="text-gray-500 text-center py-12">Loading…</p>
      ) : photos.length === 0 ? (
        <div className="bg-white border border-rule rounded-lg p-8 text-center text-gray-500">
          No pending photo submissions.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((p) => {
            const src = photoUrl(p.file_path);
            return (
              <div key={p.id} className="bg-white border border-rule rounded-lg overflow-hidden">
                {src ? (
                  <img src={src} alt="" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square bg-mist grid place-items-center text-gray-300 text-4xl">
                    👤
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-medium text-ink">{p.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.submitted_at).toLocaleDateString("en-NG")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => review(p.id, true)}
                      className="flex-1 rounded bg-green-600 text-white py-1.5 text-xs">Approve</button>
                    <button onClick={() => review(p.id, false)}
                      className="flex-1 rounded bg-red-600 text-white py-1.5 text-xs">Reject</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
