"use client";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

const MOCK_MEMBER = {
  profile: { display_name: "Bro. Emmanuel Adeyemi", role: "member" },
  member: {
    id: "m3", member_number: "OIB-0023", full_name: "Emmanuel Adeyemi",
    preferred_display_name: "Bro. Emmanuel", membership_status: "active",
    profile_photo_path: "https://i.pravatar.cc/150?img=12",
    profile_photo_status: "approved", date_joined: "2016-03-14",
  },
  birthday_preferences: {
    public_birthday_name_allowed: true, public_photo_allowed: true,
    public_birthday_date_allowed: false, announcement_design_allowed: true,
    gallery_photo_allowed: true, birthday_contact_preference: "any",
  },
};

export default function MemberPortal() {
  const [tab, setTab] = useState<"home" | "prefs">("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("demo@onachurch.org");
  const [pass, setPass] = useState("password");
  const data = MOCK_MEMBER;

  if (!loggedIn) {
    return (
      <>
        <SiteHeader name="Ona-Igbala Baptist Church" />
        <div className="min-h-screen bg-mist grid place-items-center">
          <div className="bg-white border border-rule rounded-lg p-8 w-full max-w-sm shadow">
            <h1 className="font-display text-2xl text-ink mb-2">Member Portal</h1>
            <p className="text-sm text-gray-500 mb-6">Sign in to manage your profile and birthday preferences.</p>
            <form onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="w-full rounded border border-rule px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password"
                  className="w-full rounded border border-rule px-3 py-2 text-sm" />
              </div>
              <p className="text-xs text-gray-400">Demo: any credentials will work</p>
              <button type="submit" className="w-full rounded bg-ink text-white py-2 text-sm font-medium">Sign In</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader name="Ona-Igbala Baptist Church" />
      <main className="bg-mist min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {/* Header */}
          <div className="bg-white rounded-lg border border-rule p-6 flex gap-5 items-center mb-8">
            <img src={data.member.profile_photo_path!} alt="" className="w-16 h-16 rounded-full object-cover" />
            <div className="flex-1">
              <p className="font-display text-xl text-ink">{data.member.preferred_display_name}</p>
              <p className="text-sm text-gray-500">{data.member.member_number}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">{data.member.membership_status}</span>
            </div>
            <button onClick={() => setLoggedIn(false)} className="text-xs text-steel hover:underline">Sign out</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(["home", "prefs"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded text-sm font-medium ${tab === t ? "bg-navy text-white" : "bg-white border border-rule text-steel"}`}>
                {t === "home" ? "My Profile" : "Birthday Preferences"}
              </button>
            ))}
          </div>

          {tab === "home" && (
            <div className="bg-white rounded-lg border border-rule p-6 space-y-4">
              <h2 className="font-display text-lg text-ink">Profile Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Full Name</span><span className="font-medium text-ink">{data.member.full_name}</span></div>
                <div><span className="text-gray-500 block">Display Name</span><span className="font-medium text-ink">{data.member.preferred_display_name}</span></div>
                <div><span className="text-gray-500 block">Member Number</span><span className="font-medium text-ink font-mono">{data.member.member_number}</span></div>
                <div><span className="text-gray-500 block">Date Joined</span><span className="font-medium text-ink">{data.member.date_joined ? new Date(data.member.date_joined).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" }) : "—"}</span></div>
                <div><span className="text-gray-500 block">Photo Status</span><span className={`font-medium ${data.member.profile_photo_status === "approved" ? "text-green-700" : "text-amber-600"}`}>{data.member.profile_photo_status}</span></div>
              </div>
            </div>
          )}

          {tab === "prefs" && data.birthday_preferences && (
            <div className="bg-white rounded-lg border border-rule p-6">
              <h2 className="font-display text-lg text-ink mb-4">Birthday Preferences</h2>
              <p className="text-sm text-gray-500 mb-5">Control how your birthday is celebrated on the church platform.</p>
              <div className="space-y-4">
                {[
                  { key: "public_birthday_name_allowed",    label: "Show my name on birthday displays" },
                  { key: "public_photo_allowed",            label: "Show my photo on birthday displays" },
                  { key: "public_birthday_date_allowed",    label: "Show my birth date publicly" },
                  { key: "announcement_design_allowed",     label: "Create a birthday graphic for me" },
                  { key: "gallery_photo_allowed",           label: "Include me in gallery birthday boards" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm text-ink">{label}</span>
                    <input type="checkbox" defaultChecked={(data.birthday_preferences as any)[key]}
                      className="w-4 h-4 accent-navy" />
                  </label>
                ))}
              </div>
              <button className="mt-6 rounded bg-ink text-white px-5 py-2 text-sm font-medium">Save preferences</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
