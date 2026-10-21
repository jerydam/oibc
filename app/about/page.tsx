import type { SiteSettings } from "@/lib/types";
import { api } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CHURCH } from "@/lib/church";
import PageHeader from "@/components/PageHeader";

export const revalidate = 3600;

export default async function AboutPage() {
  const [s, departments] = await Promise.all([
    api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" })),
    api.departments().catch(() => []),
  ]);

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        {/* Hero */}
        <PageHeader title="A family growing together in faith, love, and service" max="max-w-4xl" />

        <div className="mx-auto max-w-4xl px-4 py-12 space-y-14">
          <section className="rounded-2xl bg-navy p-8 text-white">
            <h2 className="mb-3 font-display text-2xl font-bold text-gold">Our motto</h2>
            <p className="text-xl">{CHURCH.motto}.</p>
            <p className="mt-4 text-white/75">Our watchword for {CHURCH.watchword.year}: {CHURCH.watchword.lead} {CHURCH.watchword.main} {CHURCH.watchword.second}, {CHURCH.watchword.sub.toLowerCase()}.</p>
          </section>

          {/* Mission */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              We exist to worship God wholeheartedly, grow spiritually as a community,
              and serve one another and the world around us with the love of Christ.
              Every program, service, and gathering flows from this central purpose.
            </p>
          </section>

          {/* Vision */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To be a church where every person — regardless of background — finds a
              genuine spiritual home, encounters the living God, and discovers their
              God-given purpose in the body of Christ.
            </p>
          </section>

          {/* Beliefs */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-6">What We Believe</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                ["The Bible", "We believe the Holy Scriptures are the inspired Word of God and the supreme authority for faith and practice."],
                ["The Trinity", "We believe in one God — Father, Son, and Holy Spirit — three persons in perfect unity."],
                ["Salvation", "We believe salvation is by grace through faith in Jesus Christ alone, not by human works."],
                ["The Church", "We believe the Church is the body of Christ, called to worship, fellowship, discipleship, and mission."],
                ["Prayer", "We believe prayer is essential — communing with God changes hearts, circumstances, and communities."],
                ["Eternal Life", "We believe in the resurrection of the dead and the eternal life promised to all who believe."],
              ].map(([title, desc]) => (
                <li key={title} className="bg-white rounded-lg p-5 border border-rule">
                  <h3 className="font-semibold text-ink mb-1">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Service Times */}
          {s.service_times && (
            <section className="bg-white rounded-lg p-6 border border-rule">
              <h2 className="font-display text-2xl text-ink mb-3">Service Times</h2>
              <p className="text-gray-700 whitespace-pre-line">{s.service_times}</p>
            </section>
          )}

          {/* Departments */}
          {departments.length > 0 && (
            <section>
              <h2 className="font-display text-2xl text-ink mb-6">Our Departments &amp; Fellowships</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {departments.map((d) => (
                  <div key={d.id} className="bg-white rounded-lg p-4 border border-rule">
                    <h3 className="font-semibold text-ink">{d.name}</h3>
                    {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                    {d.leader_name && (
                      <p className="text-xs text-gray-500 mt-2">Leader: {d.leader_name}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location */}
          {s.address && (
            <section>
              <h2 className="font-display text-2xl text-ink mb-3">Find Us</h2>
              <p className="text-gray-700">{s.address}</p>
            </section>
          )}
        </div>
      </main>
      <SiteFooter s={s as import("@/lib/types").SiteSettings} />
    </>
  );
}