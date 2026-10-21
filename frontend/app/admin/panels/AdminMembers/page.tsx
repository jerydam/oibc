"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { adminApi } from "@/lib/api";
import type { Member, Role } from "@/lib/types";

// ── Shared UI helpers ─────────────────────────────────────────

const inp  = "w-full rounded border border-rule px-3 py-2 text-sm";
const btnP = "rounded bg-ink text-white px-4 py-2 text-sm font-medium disabled:opacity-60";
const btnG = "rounded border border-rule px-4 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-ink text-white text-sm px-5 py-3 rounded-lg shadow-lg">
      {msg}
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  active:      "bg-green-100 text-green-800",
  pending:     "bg-yellow-100 text-yellow-800",
  inactive:    "bg-gray-100 text-gray-500",
  transferred: "bg-blue-100 text-blue-800",
  deceased:    "bg-red-100 text-red-700",
};

const ROLE_BADGE: Record<string, string> = {
  super_admin:          "bg-purple-100 text-purple-800",
  pastor:               "bg-indigo-100 text-indigo-800",
  secretary:            "bg-blue-100 text-blue-800",
  birthday_coordinator: "bg-pink-100 text-pink-800",
  media_team:           "bg-orange-100 text-orange-800",
  member:               "bg-gray-100 text-gray-500",
};

// ── Tab type ──────────────────────────────────────────────────

type Tab = "members" | "registrations" | "invite";

// ── Inner component (receives token) ─────────────────────────

function AdminMembersInner({ token }: { token: string }) {
  const api = adminApi(token);

  const [tab, setTab]         = useState<Tab>("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [regs, setRegs]       = useState<any[]>([]);
  const [roles, setRoles]     = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState("");

  // Edit/role modal
  const [editMember, setEditMember]   = useState<Member | null>(null);
  const [editForm, setEditForm]       = useState<Partial<Member & { role: string }>>({});
  const [editSaving, setEditSaving]   = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    full_name: "", email: "", preferred_display_name: "",
    phone: "", role_name: "member",
  });
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteErr, setInviteErr]       = useState("");
  const [inviteDone, setInviteDone]     = useState(false);

  // Add-member (no email/invite) form
  const [addForm, setAddForm] = useState({
    full_name: "", preferred_display_name: "", email: "",
    phone: "", date_of_birth: "", address: "", date_joined: "",
    membership_status: "active",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [addErr, setAddErr]       = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [m, r, ro] = await Promise.all([
        api.members(),
        api.pendingRegistrations(),
        api.listRoles(),
      ]);
      setMembers(m);
      setRegs(r);
      setRoles(ro);
    } catch { /* non-fatal */ } finally {
      setLoading(false);
    }
  }

  // ── Members tab ───────────────────────────────────────────

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.member_number ?? "").includes(search) ||
    (m.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openEdit(m: Member) {
    setEditMember(m);
    setEditForm({ ...m });
  }

  async function saveEdit() {
    if (!editMember) return;
    setEditSaving(true);
    try {
      const { role, ...rest } = editForm;
      // Save member fields
      await api.updateMember(editMember.id, rest);
      // Save role separately if changed
      if (role && role !== editMember.role) {
        await api.assignRole(editMember.id, role);
      }
      setToast("Member saved.");
      setEditMember(null);
      loadAll();
    } catch (e: any) {
      setToast("Error: " + (e.message ?? "failed"));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Add member (no login) ─────────────────────────────────

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddSaving(true); setAddErr("");
    try {
      await api.createMember(addForm);
      setToast("Member added.");
      setShowAddForm(false);
      setAddForm({
        full_name: "", preferred_display_name: "", email: "",
        phone: "", date_of_birth: "", address: "", date_joined: "",
        membership_status: "active",
      });
      loadAll();
    } catch (e: any) {
      const msg = e.message ?? "Failed";
      // Handle duplicate conflict
      if (msg.includes("409") || msg.includes("duplicate")) {
        setAddErr("A member with this email, phone, or name+DOB already exists.");
      } else {
        setAddErr(msg);
      }
    } finally {
      setAddSaving(false);
    }
  }

  // ── Invite by email ───────────────────────────────────────

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteSaving(true); setInviteErr(""); setInviteDone(false);
    try {
      await api.inviteMember(inviteForm);
      setInviteDone(true);
      setInviteForm({ full_name: "", email: "", preferred_display_name: "", phone: "", role_name: "member" });
      loadAll();
    } catch (e: any) {
      setInviteErr(e.message ?? "Invite failed.");
    } finally {
      setInviteSaving(false);
    }
  }

  // ── Registrations tab ─────────────────────────────────────

  async function approveReg(id: string) {
    try {
      await api.approveRegistration(id);
      setToast("Registration approved — member created.");
      loadAll();
    } catch (e: any) { setToast("Error: " + e.message); }
  }

  async function rejectReg(id: string) {
    const reason = window.prompt("Reason for rejection (optional):") ?? "";
    try {
      await api.rejectRegistration(id, reason);
      setToast("Registration rejected.");
      loadAll();
    } catch (e: any) { setToast("Error: " + e.message); }
  }

  // ── Render ────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "members",       label: "Members",       },
    { key: "registrations", label: "Registrations", badge: regs.length },
    { key: "invite",        label: "Add / Invite",  },
  ];

  return (
    <div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-ink">Members</h1>
        {tab === "members" && (
          <span className="text-sm text-gray-400">{members.length} records</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-rule">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t flex items-center gap-1.5 transition-colors
              ${tab === t.key
                ? "bg-white border border-b-white border-rule -mb-px text-ink"
                : "text-gray-500 hover:text-ink"}`}>
            {t.label}
            {t.badge ? (
              <span className="bg-ember text-white text-xs rounded-full min-w-[18px] h-[18px] grid place-items-center px-1">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Tab: Members ── */}
      {tab === "members" && (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, member number, or email…"
            className={`${inp} mb-4`} />

          {/* Edit modal */}
          {editMember && (
            <div className="fixed inset-0 z-40 bg-black/40 overflow-y-auto p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-6 my-8">
                <h3 className="font-display text-lg text-ink mb-4">Edit Member</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Full Name *">
                      <input className={inp} value={editForm.full_name ?? ""}
                        onChange={e => setEditForm({...editForm, full_name: e.target.value})} />
                    </Field>
                  </div>
                  <Field label="Display Name">
                    <input className={inp} value={editForm.preferred_display_name ?? ""}
                      onChange={e => setEditForm({...editForm, preferred_display_name: e.target.value})} />
                  </Field>
                  <Field label="Status">
                    <select className={`${inp} bg-white`} value={editForm.membership_status ?? "active"}
                      onChange={e => setEditForm({...editForm, membership_status: e.target.value})}>
                      {["pending","active","inactive","transferred","deceased"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email">
                    <input type="email" className={inp} value={editForm.email ?? ""}
                      onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </Field>
                  <Field label="Phone">
                    <input className={inp} value={editForm.phone ?? ""}
                      onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" className={inp} value={editForm.date_of_birth ?? ""}
                      onChange={e => setEditForm({...editForm, date_of_birth: e.target.value})} />
                  </Field>
                  <Field label="Date Joined">
                    <input type="date" className={inp} value={editForm.date_joined ?? ""}
                      onChange={e => setEditForm({...editForm, date_joined: e.target.value})} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address">
                      <input className={inp} value={editForm.address ?? ""}
                        onChange={e => setEditForm({...editForm, address: e.target.value})} />
                    </Field>
                  </div>

                  {/* ── Role assignment ── */}
                  <div className="sm:col-span-2 pt-2 border-t border-rule">
                    <p className="text-xs font-semibold text-ink mb-3">System Role</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roles.map(r => (
                        <label key={r.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors
                            ${(editForm.role ?? editMember.role ?? "member") === r.name
                              ? "border-ink bg-ink/5"
                              : "border-rule hover:border-gray-400"}`}>
                          <input type="radio" name="role" value={r.name} className="sr-only"
                            checked={(editForm.role ?? editMember.role ?? "member") === r.name}
                            onChange={() => setEditForm({...editForm, role: r.name})} />
                          <p className="font-medium text-ink text-xs">{r.name.replace("_", " ")}</p>
                          {r.description && (
                            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{r.description}</p>
                          )}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Role controls what this member can access in the admin area.
                      Only applies to members with a login account.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-5">
                  <button className={btnG} onClick={() => setEditMember(null)}>Cancel</button>
                  <button className={btnP} disabled={editSaving} onClick={saveEdit}>
                    {editSaving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-gray-400 text-center py-12">Loading…</p>
          ) : (
            <div className="bg-white rounded-lg border border-rule overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-mist text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Member #</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Role</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-mist/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.member_number}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {m.profile_photo_path
                            ? <img src={m.profile_photo_path} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                            : <div className="w-7 h-7 rounded-full bg-rule grid place-items-center text-gray-400 text-xs shrink-0">?</div>
                          }
                          <div>
                            <p className="font-medium text-ink">{m.full_name}</p>
                            <p className="text-xs text-gray-400">{m.preferred_display_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{m.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[m.membership_status] ?? "bg-gray-100 text-gray-500"}`}>
                          {m.membership_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {m.role ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[m.role] ?? "bg-gray-100 text-gray-500"}`}>
                            {m.role.replace("_", " ")}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEdit(m)} className="text-xs text-royal hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Tab: Registrations ── */}
      {tab === "registrations" && (
        <div>
          <p className="text-sm text-gray-500 mb-5">
            These are self-submitted registration requests awaiting review.
            Approving creates a member record. Rejecting archives the request.
          </p>

          {loading ? (
            <p className="text-gray-400 text-center py-12">Loading…</p>
          ) : regs.length === 0 ? (
            <div className="bg-white border border-rule rounded-lg p-10 text-center text-gray-400">
              No pending registrations.
            </div>
          ) : (
            <div className="space-y-4">
              {regs.map((r: any) => {
                const p = r.payload ?? r;
                return (
                  <div key={r.id} className="bg-white border border-rule rounded-lg p-5 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-ink">{p.full_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {p.email ?? "No email"} · {p.phone ?? "No phone"}
                      </p>
                      {p.date_of_birth && (
                        <p className="text-xs text-gray-400 mt-0.5">DOB: {p.date_of_birth}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted {new Date(r.created_at).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                      {/* Birthday consent flags */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {p.allow_name  && <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">Allow name on birthday</span>}
                        {p.allow_photo && <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">Allow photo</span>}
                        {p.allow_date  && <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">Allow date</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 items-start">
                      <button onClick={() => approveReg(r.id)}
                        className="rounded bg-green-600 text-white text-sm px-4 py-1.5 font-medium">
                        Approve
                      </button>
                      <button onClick={() => rejectReg(r.id)}
                        className="rounded bg-red-100 text-red-700 text-sm px-4 py-1.5 font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Add / Invite ── */}
      {tab === "invite" && (
        <div className="space-y-8">

          {/* ── Section A: Invite by email ── */}
          <section className="bg-white border border-rule rounded-lg p-6">
            <h2 className="font-display text-lg text-ink mb-1">Invite a Member by Email</h2>
            <p className="text-sm text-gray-500 mb-5">
              Creates the member record and sends an invite email with a login link.
              The member sets their own password on first sign-in.
            </p>

            {inviteDone && (
              <div className="mb-4 rounded border border-green-200 bg-green-50 text-green-800 text-sm px-4 py-3">
                ✓ Invite sent! The member will receive an email with login instructions.
              </div>
            )}
            {inviteErr && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                {inviteErr}
              </div>
            )}

            <form onSubmit={handleInvite} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Full Name *">
                  <input required className={inp} value={inviteForm.full_name}
                    onChange={e => setInviteForm({...inviteForm, full_name: e.target.value})} />
                </Field>
              </div>
              <Field label="Email Address *">
                <input required type="email" className={inp} value={inviteForm.email}
                  onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
              </Field>
              <Field label="Display Name">
                <input className={inp} value={inviteForm.preferred_display_name}
                  placeholder="e.g. Bro. Emmanuel"
                  onChange={e => setInviteForm({...inviteForm, preferred_display_name: e.target.value})} />
              </Field>
              <Field label="Phone">
                <input className={inp} value={inviteForm.phone}
                  onChange={e => setInviteForm({...inviteForm, phone: e.target.value})} />
              </Field>
              <Field label="Assign Role">
                <select className={`${inp} bg-white`} value={inviteForm.role_name}
                  onChange={e => setInviteForm({...inviteForm, role_name: e.target.value})}>
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name.replace(/_/g, " ")} — {r.description ?? ""}</option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className={btnP} disabled={inviteSaving}>
                  {inviteSaving ? "Sending invite…" : "Send Invite Email"}
                </button>
              </div>
            </form>
          </section>

          {/* ── Section B: Add without login ── */}
          <section className="bg-white border border-rule rounded-lg p-6">
            <h2 className="font-display text-lg text-ink mb-1">Add Member Manually</h2>
            <p className="text-sm text-gray-500 mb-5">
              Creates a member record without sending any email. Useful for existing members
              who don't need a login account yet.
            </p>

            {!showAddForm ? (
              <button className={btnP} onClick={() => setShowAddForm(true)}>
                + Add Member
              </button>
            ) : (
              <>
                {addErr && (
                  <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                    {addErr}
                  </div>
                )}
                <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Full Name *">
                      <input required className={inp} value={addForm.full_name}
                        onChange={e => setAddForm({...addForm, full_name: e.target.value})} />
                    </Field>
                  </div>
                  <Field label="Display Name">
                    <input className={inp} placeholder="e.g. Sis. Amaka"
                      value={addForm.preferred_display_name}
                      onChange={e => setAddForm({...addForm, preferred_display_name: e.target.value})} />
                  </Field>
                  <Field label="Status">
                    <select className={`${inp} bg-white`} value={addForm.membership_status}
                      onChange={e => setAddForm({...addForm, membership_status: e.target.value})}>
                      {["pending","active","inactive","transferred","deceased"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Email">
                    <input type="email" className={inp} value={addForm.email}
                      onChange={e => setAddForm({...addForm, email: e.target.value})} />
                  </Field>
                  <Field label="Phone">
                    <input className={inp} value={addForm.phone}
                      onChange={e => setAddForm({...addForm, phone: e.target.value})} />
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" className={inp} value={addForm.date_of_birth}
                      onChange={e => setAddForm({...addForm, date_of_birth: e.target.value})} />
                  </Field>
                  <Field label="Date Joined">
                    <input type="date" className={inp} value={addForm.date_joined}
                      onChange={e => setAddForm({...addForm, date_joined: e.target.value})} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address">
                      <input className={inp} value={addForm.address}
                        onChange={e => setAddForm({...addForm, address: e.target.value})} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3">
                    <button type="button" className={btnG}
                      onClick={() => { setShowAddForm(false); setAddErr(""); }}>
                      Cancel
                    </button>
                    <button type="submit" className={btnP} disabled={addSaving}>
                      {addSaving ? "Adding…" : "Add Member"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* ── Section C: Role guide ── */}
          <section className="bg-white border border-rule rounded-lg p-6">
            <h2 className="font-display text-lg text-ink mb-4">Role Reference</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {roles.map(r => (
                <div key={r.id} className="border border-rule rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[r.name] ?? "bg-gray-100 text-gray-500"}`}>
                      {r.name.replace(/_/g, " ")}
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                  {r.permissions?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Permissions: {r.permissions.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────

export default function AdminMembers() {
  const [token, setToken]     = useState<string | null>(null);
  const [authReady, setReady] = useState(false);

  useEffect(() => {
    getToken().then(t => { setToken(t); setReady(true); });
  }, []);

  if (!authReady) return <p className="text-gray-400 text-center py-12">Loading…</p>;
  if (!token)    return <p className="text-red-500 text-center py-12">Not authenticated.</p>;
  return <AdminMembersInner token={token} />;
}
