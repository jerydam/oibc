import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import { MOCK_SETTINGS, MOCK_ANNOUNCEMENTS } from "@/lib/mockData";

export const revalidate = 300;

export default async function AnnouncementsPage() {
  const s = MOCK_SETTINGS;
  const announcements = MOCK_ANNOUNCEMENTS;

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Announcements" max="max-w-3xl" />
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          {announcements.map((a) => (
            <article key={a.id} className="bg-white rounded-lg border border-rule overflow-hidden">
              {a.image_path && (
                <img src={a.image_path} alt="" className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h2 className="font-display text-xl text-ink mb-2">{a.title}</h2>
                {a.published_at && (
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(a.published_at).toLocaleDateString("en-NG",
                      { day:"numeric", month:"long", year:"numeric" })}
                  </p>
                )}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{a.body}</p>
                {a.expires_at && (
                  <p className="text-xs text-gray-500 mt-3 border-t border-rule pt-3">
                    Until {new Date(a.expires_at).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
