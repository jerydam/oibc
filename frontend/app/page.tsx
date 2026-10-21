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
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 300;

export default async function HomePage() {
  const now = new Date();
  const [s, today, week, month, upcoming, mwp, announcements] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.todayCelebrants().catch(() => []),
    api.weekCelebrants().catch(() => []),
    api.monthCelebrants().catch(() => []),
    api.upcomingActivities(6).catch(() => []),
    api.currentMonthlyWord().catch(() => null),
    api.announcements().catch(() => []),
  ]);

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