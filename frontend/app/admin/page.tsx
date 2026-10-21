"use client";
import { useState } from "react";
import type { Activity, MonthlyWord, Sermon, Announcement, Department, Member, AdminOverview } from "@/lib/types";
import {
  MOCK_ADMIN_OVERVIEW, MOCK_MEMBERS, MOCK_MONTH_CELEBRANTS,
  MOCK_PENDING_REGISTRATIONS, MOCK_PENDING_PHOTOS, MOCK_ACTIVITIES,
  MOCK_MONTHLY_WORD_ARCHIVE, MOCK_SERMONS, MOCK_ANNOUNCEMENTS,
  MOCK_VISITORS, MOCK_DEPARTMENTS,
} from "@/lib/mockData";

// ── Shared helpers ────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 9); }

function Badge({ label, colour }: { label: string; colour: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour}`}>
      {label}
    </span>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full rounded border border-rule px-3 py-2 text-sm";
const btn = {
  primary: "rounded bg-ink text-white px-4 py-2 text-sm font-medium disabled:opacity-60",
  ghost:   "rounded border border-rule px-4 py-2 text-sm",
  green:   "rounded bg-green-600 text-white text-xs px-3 py-1.5",
  red:     "rounded bg-red-100 text-red-700 text-xs px-3 py-1.5",
  yellow:  "rounded bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5",
  blue:    "rounded bg-blue-100 text-blue-800 text-xs px-3 py-1.5",
};

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  setTimeout(onDone, 2200);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-ink text-white text-sm px-5 py-3 rounded-lg shadow-lg animate-fade-in">
      {msg}
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────

function OverviewPanel({ overview }: { overview: AdminOverview }) {
  const cards: [string, number, string][] = [
    ["Active Members",        overview.total_active_members,  "text-navy"],
    ["Pending Registrations", overview.pending_registrations, "text-ember"],
    ["Pending Photo Reviews", overview.pending_photos,        "text-amber-600"],
    ["Upcoming Activities",   overview.upcoming_activities,   "text-royal"],
    ["Birthdays Today",       overview.today_birthday_count,  "text-gold"],
  ];
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-6">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(([label, val, col]) => (
          <div key={label} className="bg-white rounded-lg border border-rule p-5">
            <p className={`text-3xl font-extrabold ${col}`}>{val}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Mock mode:</strong> All data is local. Changes you make persist while this tab is open, exactly as the real admin will behave once connected to the API.
      </div>
    </div>
  );
}

// ── Members ───────────────────────────────────────────────────

const EMPTY_ADD = {
  full_name: "", preferred_display_name: "", email: "",
  phone: "", date_of_birth: "", date_joined: "", membership_status: "active",
};
const EMPTY_INVITE = { full_name: "", email: "", preferred_display_name: "", phone: "" };

function MembersPanel() {
  const [tab, setTab] = useState<"list" | "add">("list");
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<Partial<Member>>({});
  const [toast, setToast] = useState("");

  // Add-without-login form
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [addErr, setAddErr]   = useState("");

  // Invite-by-email form
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [inviteErr, setInviteErr]   = useState("");
  const [inviteDone, setInviteDone] = useState(false);

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(q.toLowerCase()) ||
    m.member_number.includes(q)
  );

  function openEdit(m: Member) { setEditing(m); setForm({ ...m }); }

  function save() {
    setMembers(prev => prev.map(m => m.id === editing!.id ? { ...m, ...form } as Member : m));
    setEditing(null);
    setToast("Member updated.");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddErr("");
    if (!addForm.full_name.trim()) { setAddErr("Full name is required."); return; }
    const newMember: Member = {
      id: uid(),
      member_number: "M-" + String(members.length + 1).padStart(4, "0"),
      full_name: addForm.full_name.trim(),
      preferred_display_name: addForm.preferred_display_name || addForm.full_name.trim(),
      email: addForm.email || null,
      phone: addForm.phone || null,
      date_of_birth: addForm.date_of_birth || null,
      date_joined: addForm.date_joined || null,
      membership_status: addForm.membership_status,
      profile_photo_path: null,
      profile_photo_status: null,
      role: null,
      has_login: false,
    } as unknown as Member;
    setMembers(prev => [newMember, ...prev]);
    setAddForm(EMPTY_ADD);
    setToast("Member added.");
    setTab("list");
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteErr(""); setInviteDone(false);
    if (!inviteForm.full_name.trim() || !inviteForm.email.trim()) {
      setInviteErr("Full name and email are required."); return;
    }
    // Mock: create the member record and flag has_login=true (invite sent)
    const newMember: Member = {
      id: uid(),
      member_number: "M-" + String(members.length + 1).padStart(4, "0"),
      full_name: inviteForm.full_name.trim(),
      preferred_display_name: inviteForm.preferred_display_name || inviteForm.full_name.trim(),
      email: inviteForm.email,
      phone: inviteForm.phone || null,
      date_of_birth: null, date_joined: null,
      membership_status: "active",
      profile_photo_path: null, profile_photo_status: null,
      role: "member", has_login: true,
    } as unknown as Member;
    setMembers(prev => [newMember, ...prev]);
    setInviteForm(EMPTY_INVITE);
    setInviteDone(true);
  }

  const STATUS_BADGE: Record<string, string> = {
    active:      "bg-green-100 text-green-800",
    pending:     "bg-yellow-100 text-yellow-800",
    inactive:    "bg-gray-100 text-gray-500",
    transferred: "bg-blue-100 text-blue-800",
    deceased:    "bg-red-100 text-red-700",
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-ink">Members</h2>
        {tab === "list" && (
          <span className="text-sm text-gray-400">{members.length} records</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-rule">
        {(["list", "add"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors
              ${tab === t
                ? "bg-white border border-b-white border-rule -mb-px text-ink"
                : "text-gray-500 hover:text-ink"}`}>
            {t === "list" ? "Members" : "Add / Invite"}
          </button>
        ))}
      </div>

      {/* ── Tab: Members list ── */}
      {tab === "list" && (
        <>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by name or member number…"
            className={`${inp} mb-4`} />

          {/* Edit modal */}
          {editing && (
            <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="font-display text-lg text-ink mb-4">Edit Member</h3>
                <div className="grid gap-4">
                  <FormField label="Full Name *">
                    <input className={inp} value={form.full_name ?? ""} onChange={e => setForm({...form, full_name: e.target.value})} />
                  </FormField>
                  <FormField label="Display Name">
                    <input className={inp} value={form.preferred_display_name ?? ""} onChange={e => setForm({...form, preferred_display_name: e.target.value})} />
                  </FormField>
                  <FormField label="Status">
                    <select className={`${inp} bg-white`} value={form.membership_status ?? "active"} onChange={e => setForm({...form, membership_status: e.target.value})}>
                      {["active","pending","inactive","transferred","deceased"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Profile Photo URL">
                    <input className={inp} placeholder="https://…" value={form.profile_photo_path ?? ""} onChange={e => setForm({...form, profile_photo_path: e.target.value || null})} />
                  </FormField>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button className={btn.ghost} onClick={() => setEditing(null)}>Cancel</button>
                  <button className={btn.primary} onClick={save}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-rule overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-mist text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Member #</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Display Name</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-mist/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.member_number}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        {m.profile_photo_path
                          ? <img src={m.profile_photo_path} alt="" className="w-7 h-7 rounded-full object-cover" />
                          : <div className="w-7 h-7 rounded-full bg-rule grid place-items-center text-gray-400 text-xs">?</div>
                        }
                        {m.full_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{m.preferred_display_name}</td>
                    <td className="px-4 py-3">
                      <Badge label={m.membership_status} colour={STATUS_BADGE[m.membership_status] ?? "bg-gray-100 text-gray-500"} />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(m)} className="text-xs text-royal hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Tab: Add / Invite ── */}
      {tab === "add" && (
        <div className="space-y-8">

          {/* Section A — Invite by email */}
          <section className="bg-white border border-rule rounded-lg p-6">
            <h3 className="font-display text-lg text-ink mb-1">Invite a Member by Email</h3>
            <p className="text-sm text-gray-500 mb-5">
              Creates the member record and sends an invite email with a login link.
              The member sets their own password on first sign-in.
            </p>

            {inviteDone && (
              <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3">
                ✓ Invite sent! (mock) The member was added to the list.
              </div>
            )}
            {inviteErr && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {inviteErr}
              </div>
            )}

            <form onSubmit={handleInvite} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Full Name *">
                  <input required className={inp} value={inviteForm.full_name}
                    onChange={e => { setInviteDone(false); setInviteForm({...inviteForm, full_name: e.target.value}); }} />
                </FormField>
              </div>
              <FormField label="Email Address *">
                <input required type="email" className={inp} value={inviteForm.email}
                  onChange={e => { setInviteDone(false); setInviteForm({...inviteForm, email: e.target.value}); }} />
              </FormField>
              <FormField label="Display Name">
                <input className={inp} placeholder="e.g. Bro. Emmanuel" value={inviteForm.preferred_display_name}
                  onChange={e => setInviteForm({...inviteForm, preferred_display_name: e.target.value})} />
              </FormField>
              <FormField label="Phone">
                <input className={inp} value={inviteForm.phone}
                  onChange={e => setInviteForm({...inviteForm, phone: e.target.value})} />
              </FormField>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className={btn.primary}>Send Invite Email</button>
              </div>
            </form>
          </section>

          {/* Section B — Manual add (no login) */}
          <section className="bg-white border border-rule rounded-lg p-6">
            <h3 className="font-display text-lg text-ink mb-1">Add Member Manually</h3>
            <p className="text-sm text-gray-500 mb-5">
              Creates a member record without sending any email. Useful for existing members
              who don't need a login account yet.
            </p>

            {addErr && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {addErr}
              </div>
            )}

            <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Full Name *">
                  <input required className={inp} value={addForm.full_name}
                    onChange={e => { setAddErr(""); setAddForm({...addForm, full_name: e.target.value}); }} />
                </FormField>
              </div>
              <FormField label="Display Name">
                <input className={inp} placeholder="e.g. Sis. Amaka" value={addForm.preferred_display_name}
                  onChange={e => setAddForm({...addForm, preferred_display_name: e.target.value})} />
              </FormField>
              <FormField label="Status">
                <select className={`${inp} bg-white`} value={addForm.membership_status}
                  onChange={e => setAddForm({...addForm, membership_status: e.target.value})}>
                  {["active","pending","inactive","transferred","deceased"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Email">
                <input type="email" className={inp} value={addForm.email}
                  onChange={e => setAddForm({...addForm, email: e.target.value})} />
              </FormField>
              <FormField label="Phone">
                <input className={inp} value={addForm.phone}
                  onChange={e => setAddForm({...addForm, phone: e.target.value})} />
              </FormField>
              <FormField label="Date of Birth">
                <input type="date" className={inp} value={addForm.date_of_birth}
                  onChange={e => setAddForm({...addForm, date_of_birth: e.target.value})} />
              </FormField>
              <FormField label="Date Joined">
                <input type="date" className={inp} value={addForm.date_joined}
                  onChange={e => setAddForm({...addForm, date_joined: e.target.value})} />
              </FormField>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" className={btn.ghost}
                  onClick={() => { setAddForm(EMPTY_ADD); setAddErr(""); }}>
                  Clear
                </button>
                <button type="submit" className={btn.primary}>Add Member</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

// ── Birthdays ─────────────────────────────────────────────────

function BirthdaysPanel() {
  const celebrants = MOCK_MONTH_CELEBRANTS;
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-4">Birthdays — This Month</h2>
      <p className="text-sm text-gray-500 mb-5">Birthday dates come from member profiles. To update a date, edit the member record.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {celebrants.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-rule p-3 flex items-center gap-3">
            {c.photo_path
              ? <img src={c.photo_path} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-rule grid place-items-center text-gray-400 shrink-0">?</div>
            }
            <div className="min-w-0">
              <p className="font-medium text-ink text-sm truncate">{c.display_name}</p>
              {c.department && <p className="text-xs text-gray-500 truncate">{c.department}</p>}
              {c.date && <p className="text-xs text-royal">{new Date(c.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p>}
              {c.is_today && <span className="text-xs bg-gold/20 text-yellow-800 px-1.5 py-0.5 rounded-full">🎂 Today</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Registrations ─────────────────────────────────────────────

function RegistrationsPanel() {
  type Reg = typeof MOCK_PENDING_REGISTRATIONS[number] & { status: string };
  const [regs, setRegs] = useState<Reg[]>(MOCK_PENDING_REGISTRATIONS.map(r => ({ ...r })));
  const [toast, setToast] = useState("");

  function approve(id: string) {
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    setToast("Registration approved.");
  }
  function reject(id: string) {
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));
    setToast("Registration rejected.");
  }

  const pending  = regs.filter(r => r.status === "pending");
  const resolved = regs.filter(r => r.status !== "pending");

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <h2 className="font-display text-2xl text-ink mb-4">Pending Registrations</h2>

      {pending.length === 0 && (
        <div className="text-center py-12 text-gray-400">No pending registrations.</div>
      )}

      <div className="space-y-3 mb-8">
        {pending.map(r => (
          <div key={r.id} className="bg-white rounded-lg border border-rule p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <p className="font-medium text-ink">{r.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{r.email ?? "—"} · {r.phone ?? "—"}</p>
              <p className="text-xs text-gray-500">Referred by: {r.referral}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(r.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div className="flex gap-2 shrink-0 items-start">
              <button className={btn.green} onClick={() => approve(r.id)}>Approve</button>
              <button className={btn.red}   onClick={() => reject(r.id)}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Recently Resolved</h3>
          <div className="space-y-2">
            {resolved.map(r => (
              <div key={r.id} className="bg-white rounded-lg border border-rule p-3 flex justify-between items-center">
                <p className="text-sm text-ink">{r.full_name}</p>
                <Badge label={r.status} colour={r.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Photo Approvals ───────────────────────────────────────────

function PhotosPanel() {
  type Photo = typeof MOCK_PENDING_PHOTOS[number] & { status: string };
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PENDING_PHOTOS.map(p => ({ ...p })));
  const [toast, setToast] = useState("");

  function approve(id: string) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
    setToast("Photo approved.");
  }
  function reject(id: string) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: "rejected" } : p));
    setToast("Photo rejected.");
  }

  const pending  = photos.filter(p => p.status === "pending");
  const resolved = photos.filter(p => p.status !== "pending");

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <h2 className="font-display text-2xl text-ink mb-4">Photo Submissions</h2>

      {pending.length === 0 && (
        <div className="text-center py-12 text-gray-400">No pending photos.</div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {pending.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-rule overflow-hidden">
            <img src={p.file_path} alt="" className="w-full aspect-square object-cover" />
            <div className="p-3">
              <p className="font-medium text-ink text-sm">{p.member_name}</p>
              <p className="text-xs text-gray-500">{p.member_number}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(p.submitted_at).toLocaleDateString("en-NG")}</p>
              <div className="flex gap-2 mt-2">
                <button className={`flex-1 ${btn.green}`} onClick={() => approve(p.id)}>Approve</button>
                <button className={`flex-1 ${btn.red}`}   onClick={() => reject(p.id)}>Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Resolved</h3>
          <div className="space-y-2">
            {resolved.map(p => (
              <div key={p.id} className="bg-white rounded-lg border border-rule p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img src={p.file_path} alt="" className="w-8 h-8 rounded-full object-cover" />
                  <p className="text-sm text-ink">{p.member_name}</p>
                </div>
                <Badge label={p.status} colour={p.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Activities ────────────────────────────────────────────────

const BLANK_ACTIVITY = {
  activity_title: "", start_at: "", end_at: "", venue: "",
  description: "", cover_image_path: "", category: "",
  occurrence_status: "scheduled", department: "",
  registration_required: false, registration_deadline: "",
};

const ACT_STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  draft:     "bg-gray-100 text-gray-500",
  completed: "bg-gray-200 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

function ActivitiesPanel() {
  const [acts, setActs] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<typeof BLANK_ACTIVITY>({ ...BLANK_ACTIVITY });
  const [toast, setToast] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() { setEditing(null); setForm({ ...BLANK_ACTIVITY }); setShowForm(true); }
  function openEdit(a: Activity) {
    setEditing(a);
    setForm({
      activity_title: a.activity_title, start_at: a.start_at.slice(0, 16),
      end_at: a.end_at?.slice(0, 16) ?? "", venue: a.venue ?? "",
      description: a.description ?? "", cover_image_path: a.cover_image_path ?? "",
      category: a.category ?? "", occurrence_status: a.occurrence_status,
      department: a.department ?? "", registration_required: a.registration_required,
      registration_deadline: a.registration_deadline?.slice(0, 16) ?? "",
    });
    setShowForm(true);
  }

  function save() {
    if (editing) {
      setActs(prev => prev.map(a => a.id === editing.id
        ? { ...a, ...form, end_at: form.end_at || null, venue: form.venue || null,
            description: form.description || null, cover_image_path: form.cover_image_path || null,
            category: form.category || null, department: form.department || null,
            registration_deadline: form.registration_deadline || null }
        : a
      ));
      setToast("Activity updated.");
    } else {
      const id = uid();
      setActs(prev => [{
        id, activity_id: id, activity_title: form.activity_title,
        title: null, category: form.category || null,
        start_at: form.start_at, end_at: form.end_at || null,
        venue: form.venue || null, description: form.description || null,
        cover_image_path: form.cover_image_path || null,
        occurrence_status: form.occurrence_status,
        registration_required: form.registration_required,
        registration_deadline: form.registration_deadline || null,
        department: form.department || null,
      }, ...prev]);
      setToast("Activity created.");
    }
    setShowForm(false); setEditing(null);
  }

  function changeStatus(id: string, status: string) {
    setActs(prev => prev.map(a => a.id === id ? { ...a, occurrence_status: status } : a));
    setToast(`Marked as ${status}.`);
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Activities</h2>
        <button className={btn.primary} onClick={openNew}>+ New Activity</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-6 my-8">
            <h3 className="font-display text-lg text-ink mb-4">{editing ? "Edit Activity" : "New Activity"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Title *">
                  <input className={inp} required value={form.activity_title} onChange={set("activity_title")} />
                </FormField>
              </div>
              <FormField label="Start *">
                <input type="datetime-local" className={inp} value={form.start_at} onChange={set("start_at")} />
              </FormField>
              <FormField label="End">
                <input type="datetime-local" className={inp} value={form.end_at} onChange={set("end_at")} />
              </FormField>
              <FormField label="Venue">
                <input className={inp} value={form.venue} onChange={set("venue")} />
              </FormField>
              <FormField label="Category">
                <input className={inp} placeholder="e.g. Worship Service" value={form.category} onChange={set("category")} />
              </FormField>
              <FormField label="Department">
                <input className={inp} value={form.department} onChange={set("department")} />
              </FormField>
              <FormField label="Status">
                <select className={`${inp} bg-white`} value={form.occurrence_status} onChange={set("occurrence_status")}>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Cover Image URL">
                  <input className={inp} placeholder="https://…" value={form.cover_image_path} onChange={set("cover_image_path")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Description">
                  <textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set("description")} />
                </FormField>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="reg_req" checked={form.registration_required}
                  onChange={e => setForm(f => ({ ...f, registration_required: e.target.checked }))} />
                <label htmlFor="reg_req" className="text-sm text-ink">Registration required</label>
              </div>
              {form.registration_required && (
                <div className="sm:col-span-2">
                  <FormField label="Registration Deadline">
                    <input type="datetime-local" className={inp} value={form.registration_deadline} onChange={set("registration_deadline")} />
                  </FormField>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button className={btn.ghost} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button className={btn.primary} onClick={save}>{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {acts.map(a => (
          <div key={a.id} className="bg-white border border-rule rounded-lg p-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-ink">{a.activity_title}</p>
                <Badge label={a.occurrence_status} colour={ACT_STATUS_BADGE[a.occurrence_status] ?? "bg-gray-100 text-gray-500"} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(a.start_at).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {a.venue && ` · ${a.venue}`}
                {a.department && ` · ${a.department}`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap items-start">
              <button className={btn.ghost + " !text-xs !px-3 !py-1.5"} onClick={() => openEdit(a)}>Edit</button>
              {a.occurrence_status !== "published" && a.occurrence_status !== "cancelled" && (
                <button className={btn.green} onClick={() => changeStatus(a.id, "published")}>Publish</button>
              )}
              {a.occurrence_status === "published" && (
                <button className={btn.yellow} onClick={() => changeStatus(a.id, "draft")}>Unpublish</button>
              )}
              {a.occurrence_status !== "cancelled" && (
                <button className={btn.red} onClick={() => changeStatus(a.id, "cancelled")}>Cancel</button>
              )}
            </div>
          </div>
        ))}
        {acts.length === 0 && <div className="text-center py-12 text-gray-400">No activities yet.</div>}
      </div>
    </div>
  );
}

// ── Monthly Word ──────────────────────────────────────────────

const BLANK_MW = {
  title: "", pastor_name: "", month: "", year: "", video_url: "",
  thumbnail_path: "", scripture_reference: "", message_description: "",
  prayer_focus: "", prayer_points: "",
};

function MonthlyWordPanel() {
  const [list, setList] = useState<MonthlyWord[]>(MOCK_MONTHLY_WORD_ARCHIVE);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MonthlyWord | null>(null);
  const [form, setForm] = useState<typeof BLANK_MW>({ ...BLANK_MW });
  const [toast, setToast] = useState("");

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() { setEditing(null); setForm({ ...BLANK_MW }); setShowForm(true); }
  function openEdit(m: MonthlyWord) {
    setEditing(m);
    setForm({
      title: m.title, pastor_name: m.pastor_name ?? "",
      month: String(m.month), year: String(m.year),
      video_url: m.video_url ?? "", thumbnail_path: m.thumbnail_path ?? "",
      scripture_reference: m.scripture_reference ?? "",
      message_description: m.message_description ?? "",
      prayer_focus: m.prayer_focus ?? "",
      prayer_points: (m.prayer_points ?? []).join("\n"),
    });
    setShowForm(true);
  }

  function save() {
    const entry: MonthlyWord = {
      id: editing?.id ?? uid(),
      title: form.title, pastor_name: form.pastor_name || null,
      month: parseInt(form.month), year: parseInt(form.year),
      video_url: form.video_url || null, thumbnail_path: form.thumbnail_path || null,
      scripture_reference: form.scripture_reference || null,
      message_description: form.message_description || null,
      prayer_focus: form.prayer_focus || null,
      prayer_points: form.prayer_points ? form.prayer_points.split("\n").filter(Boolean) : [],
      published_at: editing?.published_at ?? new Date().toISOString(),
    };
    if (editing) {
      setList(prev => prev.map(m => m.id === editing.id ? entry : m));
      setToast("Monthly Word updated.");
    } else {
      setList(prev => [entry, ...prev]);
      setToast("Monthly Word created.");
    }
    setShowForm(false); setEditing(null);
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Monthly Word</h2>
        <button className={btn.primary} onClick={openNew}>+ New Entry</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-6 my-8">
            <h3 className="font-display text-lg text-ink mb-4">{editing ? "Edit Monthly Word" : "New Monthly Word"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Title *"><input className={inp} value={form.title} onChange={set("title")} /></FormField>
              </div>
              <FormField label="Pastor / Preacher">
                <input className={inp} value={form.pastor_name} onChange={set("pastor_name")} />
              </FormField>
              <FormField label="Month *">
                <select className={`${inp} bg-white`} value={form.month} onChange={set("month")}>
                  <option value="">Select…</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Year *">
                <input type="number" className={inp} placeholder="2026" value={form.year} onChange={set("year")} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Scripture Reference">
                  <input className={inp} placeholder="e.g. Romans 8:1–4" value={form.scripture_reference} onChange={set("scripture_reference")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Video URL">
                  <input className={inp} placeholder="YouTube or Vimeo link" value={form.video_url} onChange={set("video_url")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Thumbnail URL">
                  <input className={inp} placeholder="https://…" value={form.thumbnail_path} onChange={set("thumbnail_path")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Message Description">
                  <textarea className={`${inp} resize-none`} rows={4} value={form.message_description} onChange={set("message_description")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Prayer Focus">
                  <textarea className={`${inp} resize-none`} rows={2} value={form.prayer_focus} onChange={set("prayer_focus")} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Prayer Points (one per line)">
                  <textarea className={`${inp} resize-none`} rows={4} value={form.prayer_points} onChange={set("prayer_points")} />
                </FormField>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button className={btn.ghost} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button className={btn.primary} onClick={save}>{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map(m => (
          <div key={m.id} className="bg-white rounded-lg border border-rule p-4 flex items-start gap-4">
            {m.thumbnail_path && (
              <img src={m.thumbnail_path} alt="" className="w-20 aspect-video object-cover rounded shrink-0 hidden sm:block" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink">{m.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {MONTHS[(m.month ?? 1) - 1]} {m.year} · {m.pastor_name ?? "—"}
              </p>
              {m.scripture_reference && <p className="text-xs text-royal mt-0.5">{m.scripture_reference}</p>}
            </div>
            <button className="text-xs text-royal hover:underline shrink-0" onClick={() => openEdit(m)}>Edit</button>
          </div>
        ))}
        {list.length === 0 && <div className="text-center py-12 text-gray-400">No entries yet.</div>}
      </div>
    </div>
  );
}

// ── Sermons ───────────────────────────────────────────────────

const BLANK_SERMON = {
  title: "", preacher_name: "", sermon_date: "", scripture_reference: "",
  category: "", description: "", video_url: "", audio_url: "", thumbnail_path: "",
  publication_status: "draft",
};

const SER_STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft:     "bg-gray-100 text-gray-500",
  archived:  "bg-gray-200 text-gray-600",
};

function SermonsPanel() {
  const [sermons, setSermons] = useState<(Sermon & { publication_status: string })[]>(
    MOCK_SERMONS.map(s => ({ ...s, publication_status: "published" }))
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(Sermon & { publication_status: string }) | null>(null);
  const [form, setForm] = useState<typeof BLANK_SERMON>({ ...BLANK_SERMON });
  const [toast, setToast] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() { setEditing(null); setForm({ ...BLANK_SERMON }); setShowForm(true); }
  function openEdit(s: typeof sermons[number]) {
    setEditing(s);
    setForm({
      title: s.title, preacher_name: s.preacher_name ?? "",
      sermon_date: s.sermon_date ?? "", scripture_reference: s.scripture_reference ?? "",
      category: s.category ?? "", description: s.description ?? "",
      video_url: s.video_url ?? "", audio_url: s.audio_url ?? "",
      thumbnail_path: s.thumbnail_path ?? "", publication_status: s.publication_status,
    });
    setShowForm(true);
  }

  function save() {
    if (editing) {
      setSermons(prev => prev.map(s => s.id === editing.id
        ? { ...s, ...form, preacher_name: form.preacher_name || null,
            sermon_date: form.sermon_date || null, scripture_reference: form.scripture_reference || null,
            category: form.category || null, description: form.description || null,
            video_url: form.video_url || null, audio_url: form.audio_url || null,
            thumbnail_path: form.thumbnail_path || null }
        : s
      ));
      setToast("Sermon updated.");
    } else {
      const id = uid();
      setSermons(prev => [{
        id, title: form.title, preacher_name: form.preacher_name || null,
        sermon_date: form.sermon_date || null, scripture_reference: form.scripture_reference || null,
        category: form.category || null, description: form.description || null,
        video_url: form.video_url || null, audio_url: form.audio_url || null,
        thumbnail_path: form.thumbnail_path || null, publication_status: form.publication_status,
      }, ...prev]);
      setToast("Sermon created.");
    }
    setShowForm(false); setEditing(null);
  }

  function archive(id: string) {
    setSermons(prev => prev.map(s => s.id === id ? { ...s, publication_status: "archived" } : s));
    setToast("Sermon archived.");
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Sermons</h2>
        <button className={btn.primary} onClick={openNew}>+ New Sermon</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-6 my-8">
            <h3 className="font-display text-lg text-ink mb-4">{editing ? "Edit Sermon" : "New Sermon"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FormField label="Title *"><input className={inp} value={form.title} onChange={set("title")} /></FormField></div>
              <FormField label="Preacher"><input className={inp} value={form.preacher_name} onChange={set("preacher_name")} /></FormField>
              <FormField label="Date"><input type="date" className={inp} value={form.sermon_date} onChange={set("sermon_date")} /></FormField>
              <div className="sm:col-span-2"><FormField label="Scripture Reference"><input className={inp} placeholder="e.g. John 3:16" value={form.scripture_reference} onChange={set("scripture_reference")} /></FormField></div>
              <FormField label="Category"><input className={inp} placeholder="e.g. Sunday Sermon" value={form.category} onChange={set("category")} /></FormField>
              <FormField label="Status">
                <select className={`${inp} bg-white`} value={form.publication_status} onChange={set("publication_status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormField>
              <div className="sm:col-span-2"><FormField label="Video URL (YouTube / Vimeo)"><input className={inp} placeholder="https://youtube.com/…" value={form.video_url} onChange={set("video_url")} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Audio URL"><input className={inp} placeholder="https://…/audio.mp3" value={form.audio_url} onChange={set("audio_url")} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Thumbnail URL"><input className={inp} placeholder="https://…" value={form.thumbnail_path} onChange={set("thumbnail_path")} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Description"><textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set("description")} /></FormField></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button className={btn.ghost} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button className={btn.primary} onClick={save}>{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sermons.map(s => (
          <div key={s.id} className="bg-white border border-rule rounded-lg p-4 flex gap-4 items-start">
            {s.thumbnail_path && (
              <img src={s.thumbnail_path} alt="" className="w-20 aspect-video object-cover rounded shrink-0 hidden sm:block" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-ink">{s.title}</p>
                <Badge label={s.publication_status} colour={SER_STATUS_BADGE[s.publication_status] ?? "bg-gray-100 text-gray-500"} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{s.preacher_name ?? "—"} · {s.sermon_date ?? "—"}</p>
              {s.scripture_reference && <p className="text-xs text-royal mt-0.5">{s.scripture_reference}</p>}
              <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                {s.video_url && <span>📹 Video</span>}
                {s.audio_url && <span>🎵 Audio</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="text-xs text-royal hover:underline" onClick={() => openEdit(s)}>Edit</button>
              {s.publication_status !== "archived" && (
                <button className="text-xs text-red-500 hover:underline" onClick={() => archive(s.id)}>Archive</button>
              )}
            </div>
          </div>
        ))}
        {sermons.length === 0 && <div className="text-center py-12 text-gray-400">No sermons yet.</div>}
      </div>
    </div>
  );
}

// ── Announcements ─────────────────────────────────────────────

type Ann = Announcement & { status: string; target_audience: string };
const BLANK_ANN = { title: "", body: "", image_path: "", expires_at: "", target_audience: "public", status: "draft" };
const ANN_STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft:     "bg-yellow-100 text-yellow-800",
  expired:   "bg-gray-100 text-gray-500",
};

function AnnouncementsPanel() {
  const [list, setList] = useState<Ann[]>(
    MOCK_ANNOUNCEMENTS.map(a => ({ ...a, status: "published", target_audience: "public" }))
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ann | null>(null);
  const [form, setForm] = useState<typeof BLANK_ANN>({ ...BLANK_ANN });
  const [toast, setToast] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() { setEditing(null); setForm({ ...BLANK_ANN }); setShowForm(true); }
  function openEdit(a: Ann) {
    setEditing(a);
    setForm({
      title: a.title, body: a.body, image_path: a.image_path ?? "",
      expires_at: a.expires_at ? a.expires_at.slice(0, 10) : "",
      target_audience: a.target_audience, status: a.status,
    });
    setShowForm(true);
  }

  function save() {
    if (editing) {
      setList(prev => prev.map(a => a.id === editing.id
        ? { ...a, ...form, image_path: form.image_path || null, expires_at: form.expires_at || null }
        : a
      ));
      setToast("Announcement updated.");
    } else {
      setList(prev => [{
        id: uid(), title: form.title, body: form.body,
        image_path: form.image_path || null,
        published_at: new Date().toISOString(),
        expires_at: form.expires_at || null,
        status: form.status, target_audience: form.target_audience,
      }, ...prev]);
      setToast("Announcement created.");
    }
    setShowForm(false); setEditing(null);
  }

  function toggle(a: Ann) {
    setList(prev => prev.map(x => x.id === a.id ? { ...x, status: x.status === "published" ? "draft" : "published" } : x));
    setToast(a.status === "published" ? "Unpublished." : "Published.");
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Announcements</h2>
        <button className={btn.primary} onClick={openNew}>+ New Announcement</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-6 my-8">
            <h3 className="font-display text-lg text-ink mb-4">{editing ? "Edit Announcement" : "New Announcement"}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><FormField label="Title *"><input className={inp} value={form.title} onChange={set("title")} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Body *"><textarea className={`${inp} resize-none`} rows={5} value={form.body} onChange={set("body")} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Image URL (optional)"><input className={inp} placeholder="https://…" value={form.image_path} onChange={set("image_path")} /></FormField></div>
              <FormField label="Audience">
                <select className={`${inp} bg-white`} value={form.target_audience} onChange={set("target_audience")}>
                  <option value="public">Public</option>
                  <option value="members">Members</option>
                  <option value="leadership">Leadership</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select className={`${inp} bg-white`} value={form.status} onChange={set("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FormField>
              <div className="sm:col-span-2"><FormField label="Expires (optional)"><input type="date" className={inp} value={form.expires_at} onChange={set("expires_at")} /></FormField></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button className={btn.ghost} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button className={btn.primary} onClick={save}>{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map(a => (
          <div key={a.id} className="bg-white border border-rule rounded-lg p-4 flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-ink">{a.title}</p>
                <Badge label={a.status} colour={ANN_STATUS_BADGE[a.status] ?? "bg-gray-100 text-gray-500"} />
                <span className="text-xs text-gray-400">{a.target_audience}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {a.published_at ? new Date(a.published_at).toLocaleDateString("en-NG") : "—"}
                {a.expires_at && ` · expires ${new Date(a.expires_at).toLocaleDateString("en-NG")}`}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.body}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="text-xs text-royal hover:underline" onClick={() => openEdit(a)}>Edit</button>
              <button className={`text-xs rounded px-3 py-1.5 ${a.status === "published" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                onClick={() => toggle(a)}>
                {a.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-center py-12 text-gray-400">No announcements yet.</div>}
      </div>
    </div>
  );
}

// ── Visitors ──────────────────────────────────────────────────

function VisitorsPanel() {
  type Visitor = typeof MOCK_VISITORS[number];
  const [visitors, setVisitors] = useState<Visitor[]>([...MOCK_VISITORS]);
  const [toast, setToast] = useState("");

  function updateStatus(id: string, status: string) {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, follow_up_status: status } : v));
    setToast("Status updated.");
  }

  const STATUS_BADGE: Record<string, string> = {
    pending:    "bg-yellow-100 text-yellow-800",
    contacted:  "bg-green-100 text-green-800",
    not_needed: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <h2 className="font-display text-2xl text-ink mb-4">Visitor Log</h2>
      <div className="space-y-3">
        {visitors.map(v => (
          <div key={v.id} className="bg-white rounded-lg border border-rule p-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{v.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{v.email ?? "—"} · {v.phone ?? "—"}</p>
                <p className="text-xs text-gray-500">{v.service_attended}</p>
                {v.message && <p className="text-xs text-gray-600 mt-1 italic">"{v.message}"</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(v.visited_at).toLocaleDateString("en-NG")}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0 items-start sm:items-end">
                <Badge label={v.follow_up_status.replace("_", " ")} colour={STATUS_BADGE[v.follow_up_status] ?? "bg-gray-100 text-gray-500"} />
                {v.follow_up_permission && v.follow_up_status === "pending" && (
                  <button className={btn.green} onClick={() => updateStatus(v.id, "contacted")}>Mark Contacted</button>
                )}
                {v.follow_up_status === "pending" && !v.follow_up_permission && (
                  <button className={btn.yellow} onClick={() => updateStatus(v.id, "not_needed")}>No follow-up</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Departments ───────────────────────────────────────────────

const BLANK_DEPT = { name: "", description: "", leader_name: "" };

function DepartmentsPanel() {
  const [depts, setDepts] = useState<Department[]>([...MOCK_DEPARTMENTS]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<typeof BLANK_DEPT>({ ...BLANK_DEPT });
  const [toast, setToast] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openNew() { setEditing(null); setForm({ ...BLANK_DEPT }); setShowForm(true); }
  function openEdit(d: Department) {
    setEditing(d);
    setForm({ name: d.name, description: d.description ?? "", leader_name: d.leader_name ?? "" });
    setShowForm(true);
  }

  function save() {
    if (editing) {
      setDepts(prev => prev.map(d => d.id === editing.id
        ? { ...d, ...form, description: form.description || null, leader_name: form.leader_name || null }
        : d
      ));
      setToast("Department updated.");
    } else {
      setDepts(prev => [...prev, {
        id: uid(), name: form.name,
        description: form.description || null, leader_name: form.leader_name || null,
      }]);
      setToast("Department created.");
    }
    setShowForm(false); setEditing(null);
  }

  function remove(id: string) {
    if (!confirm("Delete this department?")) return;
    setDepts(prev => prev.filter(d => d.id !== id));
    setToast("Department deleted.");
  }

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Departments</h2>
        <button className={btn.primary} onClick={openNew}>+ New Department</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display text-lg text-ink mb-4">{editing ? "Edit Department" : "New Department"}</h3>
            <div className="grid gap-4">
              <FormField label="Name *"><input className={inp} value={form.name} onChange={set("name")} /></FormField>
              <FormField label="Leader Name"><input className={inp} value={form.leader_name} onChange={set("leader_name")} /></FormField>
              <FormField label="Description"><textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set("description")} /></FormField>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button className={btn.ghost} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button className={btn.primary} onClick={save}>{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {depts.map(d => (
          <div key={d.id} className="bg-white rounded-lg border border-rule p-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-ink">{d.name}</p>
                {d.leader_name && <p className="text-xs text-royal mt-0.5">Leader: {d.leader_name}</p>}
                {d.description && <p className="text-sm text-gray-600 mt-2">{d.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-xs text-royal hover:underline" onClick={() => openEdit(d)}>Edit</button>
                <button className="text-xs text-red-500 hover:underline" onClick={() => remove(d.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {depts.length === 0 && <div className="text-center py-12 text-gray-400 sm:col-span-2">No departments yet.</div>}
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────

const NAV = [
  { key: "overview",      label: "Overview" },
  { key: "members",       label: "Members" },
  { key: "birthdays",     label: "Birthdays" },
  { key: "registrations", label: "Registrations" },
  { key: "photos",        label: "Photo Approvals" },
  { key: "activities",    label: "Activities" },
  { key: "monthly-word",  label: "Monthly Word" },
  { key: "sermons",       label: "Sermons" },
  { key: "announcements", label: "Announcements" },
  { key: "visitors",      label: "Visitors" },
  { key: "departments",   label: "Departments" },
];

// ── Root ──────────────────────────────────────────────────────

export default function AdminPage() {
  const [panel, setPanel] = useState("overview");

  const renderPanel = () => {
    switch (panel) {
      case "overview":      return <OverviewPanel overview={MOCK_ADMIN_OVERVIEW} />;
      case "members":       return <MembersPanel />;
      case "birthdays":     return <BirthdaysPanel />;
      case "registrations": return <RegistrationsPanel />;
      case "photos":        return <PhotosPanel />;
      case "activities":    return <ActivitiesPanel />;
      case "monthly-word":  return <MonthlyWordPanel />;
      case "sermons":       return <SermonsPanel />;
      case "announcements": return <AnnouncementsPanel />;
      case "visitors":      return <VisitorsPanel />;
      case "departments":   return <DepartmentsPanel />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-mist flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-ink text-white shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <p className="font-display text-lg">Church Admin</p>
          <p className="text-xs text-white/50 mt-0.5">Ona-Igbala Baptist</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map(n => (
            <button key={n.key} onClick={() => setPanel(n.key)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                ${panel === n.key ? "bg-white/15 font-semibold text-white" : "hover:bg-white/5 text-white/70"}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/40">Mock data · no API</div>
      </aside>

      {/* Mobile top nav */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="md:hidden bg-ink text-white px-4 py-3 flex items-center gap-3">
          <p className="font-display text-base flex-1">Church Admin</p>
          <select value={panel} onChange={e => setPanel(e.target.value)}
            className="bg-white/10 text-white text-sm rounded px-2 py-1">
            {NAV.map(n => <option key={n.key} value={n.key}>{n.label}</option>)}
          </select>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}