import Link from "next/link";
import { videoEmbedUrl } from "@/lib/api";
import type { MonthlyWord } from "@/lib/types";

const monthLabel = (y: number, m: number) =>
  new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export default function MonthlyWordSection({ mwp }: { mwp: MonthlyWord }) {
  const embed = videoEmbedUrl(mwp.video_url);
  return (
    <section aria-labelledby="mwp-h" className="mx-auto max-w-6xl px-4 mt-14">
      <h2 id="mwp-h" className="font-display text-3xl font-bold text-navy md:text-4xl">Monthly Word &amp; Prayer</h2>
      <p className="mt-2 max-w-2xl text-steel">
        Stay connected to God&apos;s Word and grow in prayer throughout the month. Watch our
        pastor&apos;s message, reflect on the scripture, and join the church family in prayer.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 rounded-2xl bg-white border border-rule p-5 md:p-8">
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink">
            <iframe src={embed} title={mwp.title} className="h-full w-full" loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin" />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-xl bg-ink text-white/70 grid place-items-center text-sm">
            Video coming soon
          </div>
        )}

        <div>
          <p className="text-sm text-steel">{monthLabel(mwp.year, mwp.month)}</p>
          <h3 className="font-display text-2xl mt-1">Theme: {mwp.title}</h3>
          {mwp.pastor_name && <p className="text-sm text-steel mt-1">{mwp.pastor_name}</p>}
          {mwp.scripture_reference && (
            <p className="mt-4"><span className="font-medium">Scripture:</span> {mwp.scripture_reference}</p>
          )}
          {mwp.message_description && <p className="mt-3 text-ink/80 line-clamp-4">{mwp.message_description}</p>}
          {mwp.prayer_focus && <p className="mt-3 text-ink/80 line-clamp-3"><span className="font-medium">Prayer focus:</span> {mwp.prayer_focus}</p>}
          {mwp.prayer_points?.length > 0 && (
            <ol className="mt-4 list-decimal pl-5 space-y-1 text-ink/80">
              {mwp.prayer_points.slice(0, 5).map((p, i) => <li key={i}>{p}</li>)}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href={`/monthly-word/${mwp.year}/${mwp.month}`} className="rounded bg-ink text-white px-4 py-2">Read the full message</Link>
            <Link href="/monthly-word" className="rounded border border-rule px-4 py-2">Previous editions</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
