import MonthlyBirthdays from "@/components/MonthlyBirthdays";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 300;

export default async function BirthdaysPage({
  searchParams,
}: { searchParams: { year?: string; month?: string } }) {
  const now = new Date();
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Math.min(12, Math.max(1, Number(searchParams.month) || now.getMonth() + 1));

  const [settings, people] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.monthCelebrants(year, month).catch(() => []),
  ]);

  return (
    <>
      <SiteHeader name={settings.church_name} />
      <main className="pt-8">
        <MonthlyBirthdays people={people} year={year} month={month} showNav />
      </main>
      <SiteFooter s={settings} />
    </>
  );
}