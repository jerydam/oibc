
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageHeader from "@/components/PageHeader";

export default function VisitPage() {
  // We use a client component so we can handle the form submit
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await api.submitVisitor({
      name: fd.get("name") as string,
      email: fd.get("email") as string || undefined,
      phone: fd.get("phone") as string || undefined,
      service_attended: fd.get("service") as string || undefined,
      message: fd.get("message") as string || undefined,
      follow_up_permission: fd.get("followup") === "on",
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <>
      <SiteHeader name="Ona-Igbala Baptist Church" />

      <main className="bg-mist min-h-screen">
        <PageHeader title="Plan Your Visit" sub="We&apos;d love to meet you. Fill in the form below and someone from our team will be in touch if you&apos;d like a follow-up." max="max-w-3xl" />

        <div className="mx-auto max-w-3xl px-4 py-10 grid md:grid-cols-2 gap-10">
          {/* What to expect */}
          <div className="space-y-5">
            <div>
              <h2 className="font-semibold text-ink mb-1">What to expect</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                A warm, welcoming atmosphere where people of all backgrounds
                come together to worship, learn, and grow. Our services combine
                heartfelt praise, relevant teaching from the Bible, and time to
                connect with others.
              </p>
            </div>
            <div>
              <h2 className="font-semibold text-ink mb-1">Service times</h2>
              <p className="text-sm text-gray-600">Sunday Worship — 9:00 AM</p>
              <p className="text-sm text-gray-600">Bible Study — Wednesday 6:00 PM</p>
            </div>
            <div>
              <h2 className="font-semibold text-ink mb-1">Children</h2>
              <p className="text-sm text-gray-600">
                Children&apos;s Church runs concurrently during Sunday service.
                All children must be accompanied by a parent or guardian.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-rule p-6">
            {sent ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-3">🙏</p>
                <h2 className="font-display text-xl text-ink mb-2">Thank you!</h2>
                <p className="text-sm text-gray-500">
                  We look forward to welcoming you. If you requested a follow-up,
                  someone will reach out soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Name *</label>
                  <input name="name" required
                    className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input name="email" type="email"
                    className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Phone</label>
                  <input name="phone" type="tel"
                    className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Which service are you planning to attend?
                  </label>
                  <select name="service"
                    className="w-full rounded border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:border-steel">
                    <option value="">I&apos;m not sure yet</option>
                    <option>Sunday Worship (9:00 AM)</option>
                    <option>Bible Study (Wednesday 6:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Anything you&apos;d like us to know?
                  </label>
                  <textarea name="message" rows={3}
                    className="w-full rounded border border-rule px-3 py-2 text-sm focus:outline-none focus:border-steel resize-none" />
                </div>
                <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                  <input name="followup" type="checkbox" className="mt-0.5" />
                  I&apos;d welcome a friendly follow-up from the church team.
                </label>
                <button type="submit" disabled={loading}
                  className="w-full rounded bg-ink text-white py-2 text-sm font-medium disabled:opacity-60">
                  {loading ? "Sending…" : "Submit"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter s={{ church_name: "Ona-Igbala Baptist Church" }} />
    </>
  );
}