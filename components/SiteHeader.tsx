import Link from "next/link";
import Logo from "./Logo";
import { CHURCH } from "@/lib/church";

const links: [string, string][] = [
  ["About", "/about"], ["Activities", "/activities"], ["Monthly Word & Prayer", "/monthly-word"],
  ["Sermons", "/sermons"], ["Gallery", "/gallery"], ["Birthdays", "/birthdays"],
];

export default function SiteHeader(_props: { name?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="bg-navy text-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 text-sm">
          <p className="hidden truncate sm:block">{CHURCH.motto}</p>
          <Link href="/member" className="ml-auto font-bold text-gold hover:underline">Member sign in</Link>
        </div>
      </div>
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={48} />
          <span className="leading-tight">
            <span className="block font-display text-lg font-extrabold text-navy md:text-xl">{CHURCH.name}</span>
            <span className="block text-sm font-semibold text-royal">{CHURCH.tag}</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-[15px] font-semibold xl:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-ink decoration-gold decoration-[3px] underline-offset-[10px] hover:underline">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/visit" className="hidden rounded-lg bg-ember px-5 py-2.5 text-sm font-bold text-white sm:inline-block">Plan a visit</Link>
          <details className="relative xl:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-rule px-4 py-2.5 text-sm font-bold">Menu</summary>
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-rule bg-white p-2 shadow-lg">
              {[...links, ["Plan a visit", "/visit"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} href={href} className="block rounded-lg px-3 py-2 font-semibold hover:bg-mist">{label}</Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
