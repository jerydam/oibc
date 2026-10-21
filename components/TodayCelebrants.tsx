import Avatar from "./Avatar";
import type { Celebrant } from "@/lib/types";

export default function TodayCelebrants({ people }: { people: Celebrant[] }) {
  if (people.length === 0) return null;
  const single = people.length === 1;
  return (
    <section aria-labelledby="today-h" className="relative z-10 mx-auto -mt-12 max-w-6xl px-4">
      <div className="grid items-center gap-8 rounded-2xl bg-gold p-6 text-navy shadow-xl md:grid-cols-[1fr_auto] md:p-10">
        <div>
          <h2 id="today-h" className="font-display text-3xl font-black leading-tight md:text-5xl">
            {single ? `Happy birthday, ${people[0].display_name}!` : "Happy birthday to our celebrants today!"}
          </h2>
          <p className="mt-4 max-w-xl text-lg">
            Today we celebrate {single ? "a valued member" : "valued members"} of our church family. May your new year
            be filled with God&apos;s blessings, peace, joy, and wisdom.
          </p>
          <p className="mt-4 font-bold">With love from your church family.</p>
        </div>
        <ul className="flex flex-wrap justify-center gap-6">
          {people.map((p) => (
            <li key={p.id} className="text-center">
              <Avatar name={p.display_name} path={p.photo_path} size={single ? 128 : 92} ring />
              {!single && <p className="mt-2 font-display font-bold">{p.display_name}</p>}
              {p.department && <p className="text-sm">{p.department}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
