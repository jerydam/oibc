import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import { api, videoEmbedUrl } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 600;

export default async function SermonsPage() {
  const [s, sermons] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.sermons().catch(() => []),
  ]);

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Sermons" sub="Listen to recent messages from our pulpit." max="max-w-4xl" />
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
          {sermons.length === 0 && <p className="text-center py-12 text-gray-400">No sermons published yet.</p>}
          {sermons.map((sermon) => {
            const embed = videoEmbedUrl(sermon.video_url);
            return (
              <article key={sermon.id} className="bg-white rounded-lg border border-rule overflow-hidden flex flex-col sm:flex-row">
                {sermon.thumbnail_path && (
                  <div className="sm:w-56 shrink-0 bg-steel overflow-hidden">
                    <img src={sermon.thumbnail_path} alt={sermon.title} className="w-full h-40 sm:h-full object-cover" />
                  </div>
                )}
                <div className="p-5 flex-1">
                  {sermon.category && (
                    <span className="text-xs text-royal font-medium bg-blue-50 px-2 py-0.5 rounded-full">{sermon.category}</span>
                  )}
                  <h2 className="font-display text-lg text-ink mt-2">{sermon.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sermon.preacher_name}
                    {sermon.sermon_date && ` · ${new Date(sermon.sermon_date).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })}`}
                  </p>
                  {sermon.scripture_reference && <p className="text-xs text-royal mt-1">{sermon.scripture_reference}</p>}
                  {sermon.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{sermon.description}</p>}
                  {embed && (
                    <a href={sermon.video_url!} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-royal hover:underline">
                      ▶ Watch sermon
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}