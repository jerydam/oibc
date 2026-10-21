import Link from "next/link";
import type { Announcement } from "@/lib/types";

export default function AnnouncementsSection({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;
  return (
    <section aria-labelledby="ann-h" className="mx-auto max-w-6xl px-4 mt-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 id="ann-h" className="font-display text-3xl font-bold text-navy md:text-4xl">Latest announcements</h2>
        <Link href="/announcements" className="text-sm underline text-steel">View all</Link>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {announcements.slice(0, 3).map((a) => (
          <li key={a.id} className="rounded-xl bg-white border border-rule p-5">
            <h3 className="font-display text-lg">{a.title}</h3>
            {a.published_at && (
              <p className="text-xs text-steel mt-1">
                {new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
            <p className="mt-3 text-sm text-ink/80 line-clamp-3">{a.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
