import { videoEmbedUrl } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { MOCK_SETTINGS, MOCK_CURRENT_MONTHLY_WORD, MOCK_MONTHLY_WORD_ARCHIVE } from "@/lib/mockData";

export const revalidate = 3600;

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default async function MonthlyWordPage() {
  const s = MOCK_SETTINGS;
  const current = MOCK_CURRENT_MONTHLY_WORD;
  const archive = MOCK_MONTHLY_WORD_ARCHIVE;
  const embedUrl = videoEmbedUrl(current?.video_url);

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Monthly Word &amp; Prayer" sub="Stay connected to God's Word and grow in prayer throughout the month." max="max-w-4xl" />

        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Video + main content */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <p className="text-royal font-medium text-sm mb-1">{MONTHS[current.month - 1]} {current.year}</p>
                <h2 className="font-display text-2xl text-ink">{current.title}</h2>
                {current.pastor_name && <p className="text-sm text-gray-500 mt-1">— {current.pastor_name}</p>}
              </div>

              {embedUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-md">
                  <iframe src={embedUrl} title={current.title} className="w-full h-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              )}

              {!embedUrl && current.thumbnail_path && (
                <div className="aspect-video rounded-lg overflow-hidden bg-steel shadow-md">
                  <img src={current.thumbnail_path} alt={current.title} className="w-full h-full object-cover" />
                </div>
              )}

              {current.message_description && (
                <p className="text-gray-700 leading-relaxed">{current.message_description}</p>
              )}

              {current.scripture_reference && (
                <div className="bg-steel/10 rounded p-4">
                  <p className="text-xs font-medium text-steel mb-1">Key Scripture</p>
                  <p className="font-display text-ink">{current.scripture_reference}</p>
                </div>
              )}
            </div>

            {/* Prayer sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {current.prayer_focus && (
                <div className="bg-white rounded-lg border border-rule p-5">
                  <h3 className="font-semibold text-ink mb-2">Prayer Focus</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{current.prayer_focus}</p>
                </div>
              )}
              {current.prayer_points.length > 0 && (
                <div className="bg-white rounded-lg border border-rule p-5">
                  <h3 className="font-semibold text-ink mb-3">Prayer Points</h3>
                  <ol className="space-y-2">
                    {current.prayer_points.map((pt, i) => (
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

          {/* Archive */}
          {archive.length > 1 && (
            <div className="mt-14">
              <h2 className="font-display text-xl text-ink mb-4">Past Messages</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {archive.filter((m) => m.id !== current.id).map((m) => (
                  <Link key={m.id} href={`/monthly-word/${m.year}/${m.month}`}
                    className="bg-white rounded-lg border border-rule p-4 hover:shadow-sm transition-shadow">
                    {m.thumbnail_path && (
                      <div className="aspect-video rounded overflow-hidden mb-3">
                        <img src={m.thumbnail_path} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-royal font-medium">{MONTHS[m.month - 1]} {m.year}</p>
                    <p className="font-semibold text-ink mt-0.5 line-clamp-2">{m.title}</p>
                    {m.pastor_name && <p className="text-xs text-gray-500 mt-1">— {m.pastor_name}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
