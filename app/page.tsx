import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Hero from "@/components/Hero";
import WatchwordBand from "@/components/WatchwordBand";
import TodayCelebrants from "@/components/TodayCelebrants";
import BirthdayCarousel from "@/components/BirthdayCarousel";
import MonthlyBirthdays from "@/components/MonthlyBirthdays";
import UpcomingActivities from "@/components/UpcomingActivities";
import MonthlyWordSection from "@/components/MonthlyWordSection";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import {
  MOCK_SETTINGS,
  MOCK_TODAY_CELEBRANTS,
  MOCK_WEEK_CELEBRANTS,
  MOCK_MONTH_CELEBRANTS,
  MOCK_ACTIVITIES,
  MOCK_CURRENT_MONTHLY_WORD,
  MOCK_ANNOUNCEMENTS,
} from "@/lib/mockData";

export const revalidate = 300;

export default async function HomePage() {
  const now = new Date();
  const s = MOCK_SETTINGS;
  const today = MOCK_TODAY_CELEBRANTS;
  const week = MOCK_WEEK_CELEBRANTS;
  const month = MOCK_MONTH_CELEBRANTS;
  const upcoming = MOCK_ACTIVITIES.filter(
    (a) => new Date(a.start_at) >= now
  ).slice(0, 6);
  const mwp = MOCK_CURRENT_MONTHLY_WORD;
  const announcements = MOCK_ANNOUNCEMENTS;

  return (
    <>
      <SiteHeader />
      <main>
        <Hero s={s} />
        <WatchwordBand />
        <TodayCelebrants people={today} />
        {mwp && <MonthlyWordSection mwp={mwp} />}
        <UpcomingActivities activities={upcoming} />
        <AnnouncementsSection announcements={announcements} />
        <BirthdayCarousel people={week} />
        <MonthlyBirthdays people={month} year={now.getFullYear()} month={now.getMonth() + 1} />

        <section className="mt-20 bg-navy py-20 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="stretch-wide font-display text-3xl font-black md:text-4xl">You are welcome here</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">
              Whether you are new to faith or have walked with the Lord for years, there is a place for you in our church family.
            </p>
            <Link href="/visit" className="mt-8 inline-block rounded-lg bg-ember px-8 py-3.5 font-bold text-white">Plan your visit</Link>
          </div>
        </section>
      </main>
      <SiteFooter s={s} />
    </>
  );
}
