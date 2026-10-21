import Link from "next/link";
import type { Activity } from "@/lib/types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function UpcomingActivities({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) return null;
  return (
    <section aria-labelledby="upcoming-h" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="upcoming-h" className="font-display text-3xl font-bold text-navy md:text-4xl">Upcoming activities</h2>
        <Link href="/activities" className="text-sm font-bold underline underline-offset-4 decoration-gold decoration-2">View all</Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => {
          const start = new Date(a.start_at);
          return (
            <li key={a.id} className="flex gap-4 rounded-2xl border border-rule bg-white p-5">
              <div className="grid h-16 w-14 shrink-0 place-items-center rounded-xl bg-navy text-center text-white">
                <div>
                  <div className="font-display text-2xl font-bold leading-none">{start.getDate()}</div>
                  <div className="mt-1 text-xs">{MONTHS[start.getMonth()]}</div>
                </div>
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 font-display text-lg font-bold text-navy">{a.activity_title}</p>
                <p className="text-sm text-steel">
                  {start.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  {a.venue && ` · ${a.venue}`}
                </p>
                {a.description && <p className="mt-1 line-clamp-2 text-sm text-ink/70">{a.description}</p>}
                <Link href={`/activities/${a.id}`} className="mt-2 inline-block text-sm font-bold underline underline-offset-4 decoration-gold decoration-2">Details</Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
