import { videoEmbedUrl } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { MOCK_SETTINGS, MOCK_MONTHLY_WORD_ARCHIVE } from "@/lib/mockData";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default async function MWPEditionPage({
  params,
}: { params: { year: string; month: string } }) {
  const s = MOCK_SETTINGS;
  const ed = MOCK_MONTHLY_WORD_ARCHIVE.find(
    (m) => m.year === Number(params.year) && m.month === Number(params.month)
  ) ?? MOCK_MONTHLY_WORD_ARCHIVE[0];
  if (!ed) notFound();

  const embedUrl = videoEmbedUrl(ed.video_url);

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link href="/monthly-word" className="text-sm text-steel hover:underline">← Monthly Word &amp; Prayer</Link>
          <div className="mt-6 grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-6">
              <div>
                <p className="text-royal font-medium text-sm mb-1">{MONTHS[ed.month - 1]} {ed.year}</p>
                <h1 className="font-display text-3xl text-ink">{ed.title}</h1>
                {ed.pastor_name && <p className="text-sm text-gray-500 mt-1">— {ed.pastor_name}</p>}
              </div>
              {embedUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                  <iframe src={embedUrl} title={ed.title} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              )}
              {!embedUrl && ed.thumbnail_path && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img src={ed.thumbnail_path} alt={ed.title} className="w-full h-full object-cover" />
                </div>
              )}
              {ed.message_description && <p className="text-gray-700 leading-relaxed">{ed.message_description}</p>}
              {ed.scripture_reference && (
                <div className="bg-steel/10 rounded p-4">
                  <p className="text-xs font-medium text-steel mb-1">Scripture</p>
                  <p className="font-display text-ink">{ed.scripture_reference}</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-6">
              {ed.prayer_focus && (
                <div className="bg-white rounded-lg border border-rule p-5">
                  <h3 className="font-semibold text-ink mb-2">Prayer Focus</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{ed.prayer_focus}</p>
                </div>
              )}
              {ed.prayer_points.length > 0 && (
                <div className="bg-white rounded-lg border border-rule p-5">
                  <h3 className="font-semibold text-ink mb-3">Prayer Points</h3>
                  <ol className="space-y-2">
                    {ed.prayer_points.map((pt, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-gold/40 text-ink text-xs font-bold grid place-items-center">{i + 1}</span>
                        {pt}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
