"use client";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { formatBirthday } from "@/lib/api";
import type { Celebrant } from "@/lib/types";

export default function BirthdayCarousel({ people }: { people: Celebrant[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [playing, setPlaying] = useState(true);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playing || reduced || people.length < 4) return;
    const id = setInterval(() => step(1), 4000);
    return () => clearInterval(id);
  }, [playing, people.length]);

  const btn = "rounded-lg border border-rule bg-white px-4 py-2 font-bold hover:border-navy";
  return (
    <section aria-labelledby="week-h" className="mx-auto mt-16 max-w-6xl px-4">
      <div className="flex items-end justify-between gap-4">
        <h2 id="week-h" className="font-display text-3xl font-bold text-navy md:text-4xl">Birthdays this week</h2>
        {people.length > 0 && (
          <div className="flex gap-2 text-sm">
            <button onClick={() => step(-1)} aria-label="Previous" className={btn}>Prev</button>
            <button onClick={() => step(1)} aria-label="Next" className={btn}>Next</button>
            <button onClick={() => setPlaying(!playing)} aria-pressed={!playing} className={btn}>{playing ? "Pause" : "Play"}</button>
          </div>
        )}
      </div>
      {people.length === 0 ? (
        <p className="mt-4 text-steel">No birthdays to show this week. Check back soon.</p>
      ) : (
        <ul ref={track} className="scrollbar-none mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {people.map((p, i) => (
            <li key={`${p.id}-${i}`}
              className={`w-52 shrink-0 snap-start rounded-2xl p-5 text-center ${p.is_today ? "bg-gold" : "border border-rule bg-white"}`}>
              <div className="flex justify-center"><Avatar name={p.display_name} path={p.photo_path} size={88} ring /></div>
              <p className="mt-3 font-display text-lg font-bold text-navy">{p.display_name}</p>
              <p className="text-sm text-steel">{p.is_today ? "Today" : formatBirthday(p.date)}</p>
              {p.department && <p className="mt-1 text-xs text-steel">{p.department}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
