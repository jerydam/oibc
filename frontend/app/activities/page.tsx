import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 300;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLOUR: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; category?: string };
}) {
  const year = searchParams.year ? Number(searchParams.year) : new Date().getFullYear();
  const month = searchParams.month ? Number(searchParams.month) : undefined;
  const category = searchParams.category;

  const params: Record<string, string> = { year: String(year) };
  if (month) params.month = String(month);
  if (category) params.category = category;

  const [s, activities] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.activities(params).catch(() => []),
  ]);

  const allCategories = Array.from(new Set(activities.map((a) => a.category).filter(Boolean)));

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Activities &amp; Events" max="max-w-5xl" />
        <div className="mx-auto max-w-5xl px-4 py-8">
          <form className="flex flex-wrap gap-3 mb-8">
            <select name="year" defaultValue={year} className="rounded border border-rule bg-white px-3 py-2 text-sm">
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select name="month" defaultValue={month ?? ""} className="rounded border border-rule bg-white px-3 py-2 text-sm">
              <option value="">All months</option>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select name="category" defaultValue={category ?? ""} className="rounded border border-rule bg-white px-3 py-2 text-sm">
              <option value="">All categories</option>
              {allCategories.map((c) => <option key={c!} value={c!}>{c}</option>)}
            </select>
            <button type="submit" className="rounded-full bg-navy text-white px-5 py-2 text-sm font-bold">Filter</button>
          </form>
          <div className="space-y-4">
            {activities.length === 0 && <p className="text-center py-12 text-gray-400">No activities found.</p>}
            {activities.map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-rule p-5 flex gap-5 items-start">
                <div className="shrink-0 w-16 text-center">
                  <div className="text-2xl font-bold text-royal">{new Date(a.start_at).getDate()}</div>
                  <div className="text-xs text-gray-500 uppercase">{MONTHS[new Date(a.start_at).getMonth()]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="font-semibold text-ink">{a.activity_title}</h2>
                    {a.occurrence_status !== "published" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOUR[a.occurrence_status] ?? "bg-gray-100 text-gray-600"}`}>
                        {a.occurrence_status}
                      </span>
                    )}
                    {a.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-royal font-medium">{a.category}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {fmtDate(a.start_at)} · {fmtTime(a.start_at)}
                    {a.end_at && ` – ${fmtTime(a.end_at)}`}
                    {a.venue && ` · ${a.venue}`}
                    {a.department && ` · ${a.department}`}
                  </p>
                  {a.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>}
                  {a.registration_required && <p className="text-xs text-ember mt-1 font-medium">Registration required</p>}
                </div>
                <Link href={`/activities/${a.id}`} className="shrink-0 text-sm text-steel hover:underline">Details →</Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}