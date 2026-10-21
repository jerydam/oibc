import Link from "next/link";
import Logo from "./Logo";
import { CHURCH } from "@/lib/church";
import type { SiteSettings } from "@/lib/types";

export default function SiteFooter({ s }: { s: SiteSettings }) {
  return (
    <footer className="mt-20 border-t-4 border-gold bg-navy text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 text-[15px] md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="flex gap-4">
          <Logo size={64} className="shrink-0" />
          <div>
            <p className="font-display text-xl font-extrabold text-white">{CHURCH.name}</p>
            <p className="font-semibold text-gold">{CHURCH.tag}</p>
            <p className="mt-2 max-w-xs text-white/70">{CHURCH.motto}.</p>
            <p className="mt-2 text-sm text-white/60">Established July 7, {CHURCH.established}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-white">Visit us</p>
          {s.service_times && <p className="whitespace-pre-line">{s.service_times}</p>}
          {s.address && <p className="whitespace-pre-line">{s.address}</p>}
          <Link href="/visit" className="inline-block font-bold text-gold hover:underline">Plan your visit</Link>
        </div>
        <div className="space-y-2">
          <p className="font-bold text-white">Explore</p>
          <div className="grid grid-cols-2 gap-1">
            {[["About", "/about"], ["Activities", "/activities"], ["Sermons", "/sermons"], ["Gallery", "/gallery"],
              ["Announcements", "/announcements"], ["Contact", "/contact"], ["Member sign in", "/member"]].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-gold">{l}</Link>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-white/15 px-4 py-5 text-center text-sm text-white/60">
        Member details are shown only with each member&apos;s permission.
      </p>
    </footer>
  );
}
