import { photoUrl } from "@/lib/api";

/** Circular photo. `ring` adds the church-logo style ring around it. */
export default function Avatar({ name, path, size = 96, ring = false }:
  { name: string; path: string | null; size?: number; ring?: boolean }) {
  const src = photoUrl(path);
  const frame = `rounded-full ${ring ? "ring-4 ring-white shadow-md" : ""}`;
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className={`${frame} object-cover`} style={{ width: size, height: size }} />;
  }
  return (
    <div role="img" aria-label={name} className={`${frame} grid place-items-center bg-navy font-display font-bold text-white`}
      style={{ width: size, height: size, fontSize: size / 2.6 }}>
      {initials}
    </div>
  );
}
