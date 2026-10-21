import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { photoUrl } from "@/lib/api";
import { MOCK_SETTINGS, MOCK_ACTIVITIES } from "@/lib/mockData";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 300;

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const s = MOCK_SETTINGS;
  const activity = MOCK_ACTIVITIES.find((a) => a.id === params.id) ?? MOCK_ACTIVITIES[0];
  if (!activity) notFound();

  const start = new Date(activity.start_at);
  const end = activity.end_at ? new Date(activity.end_at) : null;

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        {activity.cover_image_path && (
          <div className="h-64 bg-steel overflow-hidden">
            <img src={activity.cover_image_path} alt={activity.activity_title} className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Link href="/activities" className="text-sm text-steel hover:underline">← All Activities</Link>
          <p className="text-royal font-medium text-sm mb-2 mt-4">{activity.category ?? "Church Activity"}</p>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-6">{activity.activity_title}</h1>

          <div className="bg-white rounded-lg border border-rule p-6 mb-8 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-0.5">Date</span>
              <span className="font-medium text-ink">{start.getDate()} {MONTHS[start.getMonth()]} {start.getFullYear()}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Time</span>
              <span className="font-medium text-ink">
                {start.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                {end && ` – ${end.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`}
              </span>
            </div>
            {activity.venue && (
              <div>
                <span className="text-gray-500 block mb-0.5">Venue</span>
                <span className="font-medium text-ink">{activity.venue}</span>
              </div>
            )}
            {activity.department && (
              <div>
                <span className="text-gray-500 block mb-0.5">Organised by</span>
                <span className="font-medium text-ink">{activity.department}</span>
              </div>
            )}
            {activity.registration_required && activity.registration_deadline && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 block mb-0.5">Registration deadline</span>
                <span className="font-medium text-red-600">
                  {new Date(activity.registration_deadline).toLocaleDateString("en-NG")}
                </span>
              </div>
            )}
          </div>

          {activity.registration_required && (
            <div className="mb-8 bg-gold/10 border border-gold/40 rounded-lg p-4 text-sm text-ink">
              <p className="font-semibold mb-1">Registration required for this event</p>
              <p className="text-gray-600">Please contact the church office or your department leader to register.</p>
            </div>
          )}

          {activity.description && (
            <div className="prose prose-sm max-w-none text-gray-700 mb-8 whitespace-pre-line">
              {activity.description}
            </div>
          )}

          {activity.occurrence_status === "cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700 text-sm">
              This activity has been cancelled. Please check for updates.
            </div>
          )}
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
