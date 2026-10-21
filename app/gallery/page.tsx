import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { MOCK_SETTINGS, MOCK_GALLERY_ALBUMS } from "@/lib/mockData";

export const revalidate = 600;

export default async function GalleryPage({
  searchParams,
}: { searchParams: { year?: string } }) {
  const s = MOCK_SETTINGS;
  const year = searchParams.year ? Number(searchParams.year) : undefined;
  const albums = year
    ? MOCK_GALLERY_ALBUMS.filter((a) => a.album_date && new Date(a.album_date).getFullYear() === year)
    : MOCK_GALLERY_ALBUMS;

  const years = Array.from(new Set(
    MOCK_GALLERY_ALBUMS.map((a) => a.album_date ? new Date(a.album_date).getFullYear() : null).filter(Boolean)
  )).sort((a, b) => (b as number) - (a as number));

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Church Gallery" max="max-w-5xl" />
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* Year filter */}
          <div className="flex gap-2 flex-wrap mb-8">
            <Link href="/gallery"
              className={`rounded-full px-4 py-1.5 text-sm font-medium border ${!year ? "bg-navy text-white border-navy" : "bg-white border-rule text-steel hover:border-navy"}`}>
              All years
            </Link>
            {years.map((y) => (
              <Link key={y} href={`/gallery?year=${y}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border ${year === y ? "bg-navy text-white border-navy" : "bg-white border-rule text-steel hover:border-navy"}`}>
                {y}
              </Link>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {albums.map((a) => (
              <Link key={a.id} href={`/gallery/${a.id}`}
                className="bg-white rounded-lg border border-rule overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-video bg-steel overflow-hidden">
                  {a.cover_image_path ? (
                    <img src={a.cover_image_path} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-white/30 text-4xl">📷</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-ink line-clamp-1">{a.title}</h2>
                  {a.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.description}</p>}
                  {a.album_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(a.album_date).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })}
                    </p>
                  )}
                  <p className="text-xs text-steel mt-1">{a.media_count} photo{a.media_count !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
