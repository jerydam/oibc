import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export const revalidate = 3600;

export default async function ContactPage() {
  const s = await api.settings().catch((): SiteSettings => ({ church_name: "Ona-Igbala Baptist Church" }));

  return (
    <>
      <SiteHeader name={s.church_name} />
      <main className="bg-mist min-h-screen">
        <PageHeader title="Contact Us" max="max-w-3xl" />
        <div className="mx-auto max-w-3xl px-4 py-10 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            {s.address && (
              <div>
                <h2 className="font-semibold text-ink mb-1">Address</h2>
                <p className="text-gray-600 whitespace-pre-line">{s.address}</p>
              </div>
            )}
            {s.service_times && (
              <div>
                <h2 className="font-semibold text-ink mb-1">Service Times</h2>
                <p className="text-gray-600 whitespace-pre-line">{s.service_times}</p>
              </div>
            )}
            <div>
              <h2 className="font-semibold text-ink mb-1">Get in touch</h2>
              <p className="text-sm text-gray-600">For general enquiries, membership, or pastoral matters, please use the form or speak with any of our church workers after a service.</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-rule p-6">
            <h2 className="font-display text-xl text-ink mb-4">Send a message</h2>
            <form className="space-y-4" action="#" method="POST">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Name</label>
                <input name="name" required className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input name="email" type="email" className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Message</label>
                <textarea name="message" rows={4} required className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel resize-none" />
              </div>
              <button type="submit" className="w-full rounded bg-ink text-white py-2 text-sm font-medium">Send Message</button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter s={s} />
    </>
  );
}