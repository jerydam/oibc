import MonthlyBirthdays from "@/components/MonthlyBirthdays";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { MOCK_SETTINGS, MOCK_MONTH_CELEBRANTS } from "@/lib/mockData";

export default async function BirthdaysPage({ searchParams }:
  { searchParams: { year?: string; month?: string } }) {
  const now = new Date();
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Math.min(12, Math.max(1, Number(searchParams.month) || now.getMonth() + 1));
  const settings = MOCK_SETTINGS;
  const people = MOCK_MONTH_CELEBRANTS;
  return (
    <>
      <SiteHeader name={settings.church_name} />
      <main className="pt-8"><MonthlyBirthdays people={people} year={year} month={month} showNav /></main>
      <SiteFooter s={settings} />
    </>
  );
}
