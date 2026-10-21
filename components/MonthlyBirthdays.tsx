import Link from "next/link";
import Avatar from "./Avatar";
import type { Celebrant } from "@/lib/types";

const monthName = (y: number, m: number) =>
  new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

function shift(y: number, m: number, delta: number) {
  const d = new Date(y, m - 1 + delta, 1);
  return `/birthdays?year=${d.getFullYear()}&month=${d.getMonth() + 1}`;
}

export default function MonthlyBirthdays({ people, year, month, showNav = false }:
  { people: Celebrant[]; year: number; month: number; showNav?: boolean }) {
  // group people who share a day
  const groups = new Map<string, Celebrant[]>();
  for (const p of people) {
    const key = p.date ?? "";
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return (
    <section aria-labelledby="month-h" className="mx-auto max-w-6xl px-4 mt-14">
      <div className="flex items-end justify-between gap-4">
        <h2 id="month-h" className="font-display text-3xl font-bold text-navy md:text-4xl">Birthdays in {monthName(year, month)}</h2>
        {showNav ? (
          <div className="flex gap-2 text-sm">
            <Link href={shift(year, month, -1)} className="rounded border border-rule bg-white px-3 py-2">Previous month</Link>
            <Link href={shift(year, month, 1)} className="rounded border border-rule bg-white px-3 py-2">Next month</Link>
          </div>
        ) : (
          <Link href="/birthdays" className="text-sm underline">Full list and other months</Link>
        )}
      </div>

      {people.length === 0 ? (
        <p className="mt-4 text-steel">No birthdays to show for this month.</p>
      ) : (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...groups.entries()].map(([iso, list]) => {
            const day = iso ? Number(iso.split("-")[2]) : null;
            return (
              <li key={iso} className="flex gap-4 rounded-xl bg-white border border-rule p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-navy font-display text-xl font-bold text-white">{day}</span>
                <ul className="grid gap-2">
                  {list.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <Avatar name={p.display_name} path={p.photo_path} size={40} />
                      <span>{p.display_name}{p.is_today && <span className="ml-2 text-xs rounded bg-gold px-2 py-0.5">Today</span>}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
