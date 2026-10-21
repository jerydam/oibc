import { Rings } from "./Logo";

export default function PageHeader({ title, sub, max = "max-w-6xl" }: { title: string; sub?: string; max?: string }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <Rings className="pointer-events-none absolute -right-20 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 text-white/20 md:block" />
      <div className={`relative mx-auto ${max} px-4 py-14 md:py-20`}>
        <h1 className="stretch-wide max-w-3xl font-display text-3xl font-black leading-[1.08] md:text-5xl">{title}</h1>
        {sub && <p className="mt-4 max-w-xl text-lg text-white/80">{sub}</p>}
        <div className="mt-6 h-1 w-16 rounded bg-gold" />
      </div>
    </section>
  );
}
