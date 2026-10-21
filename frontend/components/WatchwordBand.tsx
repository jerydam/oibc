import { CHURCH } from "@/lib/church";

/** Mirrors the church's printed banner: red pill, gold headline, condensed sub-line. */
export default function WatchwordBand() {
  const w = CHURCH.watchword;
  return (
    <section aria-labelledby="watchword-h" className="bg-ink pb-20 pt-12 text-center text-white md:pb-24 md:pt-16">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-sm font-bold text-white/70">Our watchword for {w.year}</p>
        <h2 id="watchword-h" className="mt-4">
          <span className="stretch-wide inline-block rounded-2xl bg-ember px-6 py-2 font-display text-xl font-extrabold md:text-3xl">
            {w.year} {w.lead.toUpperCase()}
          </span>
          <span className="stretch-wide mt-4 block font-display text-5xl font-black uppercase leading-none text-gold sm:text-7xl md:text-8xl">{w.main}</span>
          <span className="stretch-wide mt-2 block font-display text-3xl font-extrabold uppercase leading-none md:text-6xl">{w.second}</span>
        </h2>
        <p className="stretch-narrow mx-auto mt-6 max-w-3xl font-display text-xl font-bold uppercase text-white/85 md:text-3xl">{w.sub}</p>
      </div>
    </section>
  );
}
