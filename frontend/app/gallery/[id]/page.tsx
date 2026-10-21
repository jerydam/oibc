import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { notFound } from "next/navigation";

export const revalidate = 600;

export default async function AlbumPage({ params }: { params: { id: string } }) {
  const [s, albums, media] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.gallery().catch(() => []),
    api.albumMedia(params.id).catch(() => []),
  ]);

  const album = albums.find((a) => a.id === params.id);
  if (!album) notFound();

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
          {media.length === 0 && <p className="text-center py-12 text-gray-400">No photos in this album yet.</p>}
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {media.map((item) => (
              <div key={item.id} className="break-inside-avoid">
                <img src={item.file_path} alt={item.caption ?? ""} className="w-full rounded" />
                {item.caption && <p className="text-xs text-gray-500 mt-1 px-1">{item.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}