import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { MOCK_SETTINGS, MOCK_GALLERY_ALBUMS, MOCK_ALBUM_MEDIA } from "@/lib/mockData";

export const revalidate = 600;

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const s = MOCK_SETTINGS;
  const album = MOCK_GALLERY_ALBUMS.find((a) => a.id === params.id) ?? MOCK_GALLERY_ALBUMS[0];
  const media = MOCK_ALBUM_MEDIA(album.id);

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link href="/gallery" className="text-sm text-steel hover:underline">← Gallery</Link>
          <div className="mt-4 mb-8">
            <h1 className="font-display text-2xl text-ink">{album.title}</h1>
            {album.description && <p className="text-gray-500 mt-1">{album.description}</p>}
            {album.album_date && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(album.album_date).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })}
                {" · "}{album.media_count} photos
              </p>
            )}
          </div>
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {media.map((item) => (
              <div key={item.id} className="break-inside-avoid">
                <img src={item.file_path} alt={item.caption ?? ""} className="w-full rounded" />
                {item.caption && (
                  <p className="text-xs text-gray-500 mt-1 px-1">{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
