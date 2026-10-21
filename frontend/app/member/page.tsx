"use client";
import { useState, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import { supabase, signIn, signOut, getToken } from "@/lib/auth";
import { memberApi } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────

interface MeResponse {
  profile: { display_name: string; role: string };
  member: {
    id: string;
    member_number: string;
    full_name: string;
    preferred_display_name: string | null;
    membership_status: string;
    profile_photo_path: string | null;
    profile_photo_status: string | null;
    date_joined: string | null;
  };
  birthday_preferences: {
    public_birthday_name_allowed: boolean;
    public_photo_allowed: boolean;
    public_birthday_date_allowed: boolean;
    announcement_design_allowed: boolean;
    gallery_photo_allowed: boolean;
    birthday_contact_preference: string;
  } | null;
}

interface EditRequest {
  id: string;
  full_name: string | null;
  preferred_display_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  request_notes: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

// ── Toast ─────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white text-sm
                    rounded-lg px-5 py-3 shadow-lg max-w-xs text-center">
      {msg}
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────

function MemberLogin({ onAuth }: { onAuth: (token: string) => void }) {
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    const { data, error } = await signIn(email, pass);
    if (error || !data.session) {
      setErr(error?.message ?? "Sign-in failed. Check your credentials.");
      setLoading(false); return;
    }
    onAuth(data.session.access_token);
  }

  return (
    <>
      <SiteHeader name="Ona-Igbala Baptist Church" />
      <div className="min-h-screen bg-mist grid place-items-center">
        <div className="bg-white border border-rule rounded-lg p-8 w-full max-w-sm shadow">
          <h1 className="font-display text-2xl text-ink mb-2">Member Portal</h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to manage your profile and birthday preferences.
          </p>
          {err && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {err}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-rule px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Password</label>
              <input required type="password" value={pass} onChange={e => setPass(e.target.value)}
                className="w-full rounded border border-rule px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded bg-ink text-white py-2 text-sm font-medium disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Birthday preferences tab ──────────────────────────────────

const PREF_FIELDS = [
  { key: "public_birthday_name_allowed",   label: "Show my name on birthday displays" },
  { key: "public_photo_allowed",           label: "Show my photo on birthday displays" },
  { key: "public_birthday_date_allowed",   label: "Show my birth date publicly" },
  { key: "announcement_design_allowed",    label: "Create a birthday graphic for me" },
  { key: "gallery_photo_allowed",          label: "Include me in gallery birthday boards" },
];

function PrefsTab({ token, prefs: initial }: {
  token: string;
  prefs: MeResponse["birthday_preferences"];
}) {
  const api = memberApi(token);
  const [prefs, setPrefs] = useState(initial ?? {
    public_birthday_name_allowed: false,
    public_photo_allowed: false,
    public_birthday_date_allowed: false,
    announcement_design_allowed: false,
    gallery_photo_allowed: false,
    birthday_contact_preference: "any",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");

  function toggle(key: string) {
    setPrefs(p => ({ ...p, [key]: !(p as any)[key] }));
  }

  async function save() {
    setSaving(true);
    try {
      await api.saveBirthdayPrefs(prefs);
      setToast("Preferences saved.");
    } catch (e: any) {
      setToast("Error saving: " + e.message);
    } finally { setSaving(false); }
  }

  return (
    <div className="bg-white rounded-lg border border-rule p-6">
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <h2 className="font-display text-lg text-ink mb-2">Birthday Preferences</h2>
      <p className="text-sm text-gray-500 mb-5">
        Control how your birthday is celebrated on the church platform.
      </p>
      <div className="space-y-4">
        {PREF_FIELDS.map(({ key, label }) => (
          <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-ink">{label}</span>
            <input type="checkbox" checked={!!(prefs as any)[key]} onChange={() => toggle(key)}
              className="w-4 h-4 accent-navy" />
          </label>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        className="mt-6 rounded bg-ink text-white px-5 py-2 text-sm font-medium disabled:opacity-60">
        {saving ? "Saving…" : "Save preferences"}
      </button>
    </div>
  );
}

// ── Edit Request tab ──────────────────────────────────────────

const EDIT_FIELDS: [string, string, string][] = [
  ["full_name",               "Full Name",       "text"],
  ["preferred_display_name",  "Display Name",    "text"],
  ["phone",                   "Phone",           "tel"],
  ["email",                   "Email",           "email"],
  ["address",                 "Address",         "text"],
  ["date_of_birth",           "Date of Birth",   "date"],
];

const STATUS_COLOUR: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

function EditRequestTab({ token }: { token: string }) {
  const api = memberApi(token);
  const [requests, setRequests]   = useState<EditRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]         = useState("");

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    setLoading(true);
    try { setRequests(await api.myEditRequests()); }
    catch { /* non-fatal */ } finally { setLoading(false); }
  }

  const hasPending = requests.some(r => r.status === "pending");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, string> = {};
    for (const [key] of EDIT_FIELDS) {
      if (form[key]?.trim()) payload[key] = form[key].trim();
    }
    if (form.notes?.trim()) payload.request_notes = form.notes.trim();
    if (Object.keys(payload).filter(k => k !== "request_notes").length === 0) {
      setToast("Fill in at least one field to change."); return;
    }
    setSubmitting(true);
    try {
      await api.submitEditRequest(payload as any);
      setToast("Request submitted — an admin will review it shortly.");
      setForm({}); setShowForm(false);
      loadRequests();
    } catch (e: any) {
      setToast(e.message);
    } finally { setSubmitting(false); }
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-lg text-ink">Request Profile Edit</h2>
          <p className="text-sm text-gray-500">
            Changes require admin approval before taking effect.
          </p>
        </div>
        {!showForm && !hasPending && (
          <button onClick={() => setShowForm(true)}
            className="rounded bg-ink text-white text-sm px-4 py-2 font-medium">
            New Request
          </button>
        )}
      </div>

      {hasPending && !showForm && (
        <div className="mb-5 rounded border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm px-4 py-3">
          You have a pending request. Please wait for it to be reviewed before submitting another.
        </div>
      )}

      {/* New request form */}
      {showForm && (
        <form onSubmit={submit}
          className="bg-white border border-rule rounded-lg p-5 mb-6 space-y-4">
          <p className="text-sm text-gray-500">
            Fill in only the fields you want to change.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {EDIT_FIELDS.map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-ink mb-1">{label}</label>
                <input type={type} value={form[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full rounded border border-rule px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Notes for admin (optional)</label>
            <textarea rows={2} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full rounded border border-rule px-3 py-2 text-sm resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="rounded bg-ink text-white text-sm px-5 py-2 font-medium disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm({}); }}
              className="rounded border border-rule text-ink text-sm px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Past requests */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-rule rounded-lg p-8 text-center text-gray-400 text-sm">
          No edit requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-white border border-rule rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOUR[r.status] ?? ""}`}>
                  {r.status}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {EDIT_FIELDS.filter(([k]) => (r as any)[k] != null).map(([k, label]) => (
                  <div key={k} className="text-xs">
                    <span className="text-gray-500">{label}: </span>
                    <span className="font-medium text-ink">{String((r as any)[k])}</span>
                  </div>
                ))}
              </div>
              {r.request_notes && (
                <p className="text-xs text-gray-500 mt-2 italic">Note: {r.request_notes}</p>
              )}
              {r.review_notes && (
                <p className="text-xs text-gray-500 mt-1">Admin note: {r.review_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────

type Tab = "home" | "prefs" | "edit";

export default function MemberPortal() {
  const [tab, setTab]       = useState<Tab>("home");
  const [token, setToken]   = useState<string | null>(null);
  const [data, setData]     = useState<MeResponse | null>(null);
  const [authState, setAuthState] = useState<"loading" | "login" | "ok">("loading");
  const [loadErr, setLoadErr] = useState("");

  // On mount: restore session if one already exists
  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (!t) { setAuthState("login"); return; }
      await loadMe(t);
    })();
  }, []);

  // Listen for token refreshes / sign-outs from other tabs
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthState("login"); setToken(null); setData(null); return;
      }
      if (event === "TOKEN_REFRESHED" && session) {
        setToken(session.access_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadMe(t: string) {
    try {
      const me = await memberApi(t).me();
      if (me?.detail) {
        setLoadErr(me.detail);
        setAuthState("login"); return;
      }
      setToken(t); setData(me); setAuthState("ok");
    } catch (e: any) {
      setLoadErr(e.message ?? "Could not load your profile.");
      setAuthState("login");
    }
  }

  function handleAuth(t: string) { loadMe(t); }

  async function handleSignOut() {
    await signOut();
    setToken(null); setData(null); setAuthState("login");
  }

  if (authState === "loading") {
    return (
      <>
        <SiteHeader name="Ona-Igbala Baptist Church" />
        <div className="min-h-screen bg-mist grid place-items-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      </>
    );
  }

  if (authState === "login") {
    return <MemberLogin onAuth={handleAuth} />;
  }

  if (!data) return null;
  const m = data.member;

  const TABS: { key: Tab; label: string }[] = [
    { key: "home",  label: "My Profile" },
    { key: "prefs", label: "Birthday Preferences" },
    { key: "edit",  label: "Request Edit" },
  ];

  return (
    <>
      <SiteHeader name="Ona-Igbala Baptist Church" />
      <main className="bg-mist min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10">

          {/* Member header card */}
          <div className="bg-white rounded-lg border border-rule p-6 flex gap-5 items-center mb-8">
            {m.profile_photo_path ? (
              <img src={m.profile_photo_path} alt=""
                className="w-16 h-16 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-mist border border-rule flex items-center
                              justify-center text-xl font-display text-gray-400 shrink-0">
                {(m.preferred_display_name ?? m.full_name).charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl text-ink truncate">
                {m.preferred_display_name ?? m.full_name}
              </p>
              <p className="text-sm text-gray-500 font-mono">{m.member_number}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                {m.membership_status}
              </span>
            </div>
            <button onClick={handleSignOut} className="text-xs text-steel hover:underline shrink-0">
              Sign out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors
                  ${tab === t.key ? "bg-navy text-white" : "bg-white border border-rule text-steel"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === "home" && (
            <div className="bg-white rounded-lg border border-rule p-6 space-y-4">
              <h2 className="font-display text-lg text-ink">Profile Details</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Full Name</span>
                  <span className="font-medium text-ink">{m.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Display Name</span>
                  <span className="font-medium text-ink">{m.preferred_display_name ?? "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Member Number</span>
                  <span className="font-medium text-ink font-mono">{m.member_number}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date Joined</span>
                  <span className="font-medium text-ink">
                    {m.date_joined
                      ? new Date(m.date_joined).toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Photo Status</span>
                  <span className={`font-medium ${m.profile_photo_status === "approved" ? "text-green-700" : "text-amber-600"}`}>
                    {m.profile_photo_status ?? "—"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                To change your profile details, use the "Request Edit" tab.
                An admin will review and apply your changes.
              </p>
            </div>
          )}

          {/* Birthday prefs tab */}
          {tab === "prefs" && (
            <PrefsTab token={token!} prefs={data.birthday_preferences} />
          )}

          {/* Edit request tab */}
          {tab === "edit" && (
            <EditRequestTab token={token!} />
          )}
        </div>
      </main>
    </>
  );
}
