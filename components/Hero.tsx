import Link from "next/link";
import Logo, { Rings } from "./Logo";
import { CHURCH } from "@/lib/church";
import type { SiteSettings } from "@/lib/types";

export default function Hero({ s }: { s: SiteSettings }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-lg font-bold text-gold">{CHURCH.tag}</p>
          <h1 className="stretch-wide mt-2 font-display text-4xl font-black leading-[1.05] md:text-6xl">{CHURCH.name}</h1>
          <p className="mt-6 max-w-xl text-xl text-white/85">{CHURCH.motto}.</p>
          {s.service_times && (
            <p className="mt-6 max-w-xl whitespace-pre-line rounded-lg border border-white/20 bg-white/5 px-5 py-4 text-lg">{s.service_times}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/visit" className="rounded-lg bg-ember px-7 py-3.5 font-bold text-white">Plan your visit</Link>
            <Link href="/activities" className="rounded-lg border border-white/50 px-7 py-3.5 font-bold">Upcoming activities</Link>
          </div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[380px]">
          <Rings className="absolute inset-0 h-full w-full text-white/35" />
          <div className="absolute inset-[15%] rounded-full bg-white p-1 shadow-2xl">
            <Logo size={400} className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
