// Base URL points to /api — all routes below are relative to this
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// ── Helpers ──────────────────────────────────────────────────

export function photoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) return `${supabase}/storage/v1/object/public/member-photos/${path}`;
  return null;
}

export function videoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`;
  return url;
}

export function formatBirthday(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

async function get<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 300 },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

// ── Public API ───────────────────────────────────────────────

export const api = {
  settings: () => get<import("./types").SiteSettings>("/public/settings"),

  todayCelebrants: () => get<import("./types").Celebrant[]>("/public/birthdays/today"),
  weekCelebrants:  () => get<import("./types").Celebrant[]>("/public/birthdays/week"),
  monthCelebrants: (year?: number, month?: number) =>
    get<import("./types").Celebrant[]>(
      `/public/birthdays/month${year ? `?year=${year}&month=${month}` : ""}`
    ),

  upcomingActivities: (limit = 6) =>
    get<import("./types").Activity[]>(`/public/activities/upcoming?limit=${limit}`),
  activities: (params: Record<string, string | number>) =>
    get<import("./types").Activity[]>(
      "/public/activities?" + new URLSearchParams(params as Record<string, string>)
    ),
  activityDetail: (id: string) => get<import("./types").Activity>(`/public/activities/${id}`),

  currentMonthlyWord: () =>
    get<import("./types").MonthlyWord | null>("/public/monthly-word/current"),
  monthlyWordArchive: () => get<import("./types").MonthlyWord[]>("/public/monthly-word"),
  monthlyWordByDate: (year: number, month: number) =>
    get<import("./types").MonthlyWord>(`/public/monthly-word/${year}/${month}`),

  sermons: (params?: Record<string, string>) =>
    get<import("./types").Sermon[]>(
      "/public/sermons" + (params ? "?" + new URLSearchParams(params) : "")
    ),
  sermonDetail: (id: string) => get<import("./types").Sermon>(`/public/sermons/${id}`),

  announcements: () => get<import("./types").Announcement[]>("/public/announcements"),

  gallery: (year?: number) =>
    get<import("./types").GalleryAlbum[]>(`/public/gallery${year ? `?year=${year}` : ""}`),
  albumMedia: (id: string) =>
    get<Array<{ id: string; file_path: string; media_type: string; caption: string | null; display_order: number }>>(
      `/public/gallery/${id}/media`
    ),

  departments: () => get<import("./types").Department[]>("/public/departments"),

  submitVisitor: (data: {
    name: string; email?: string; phone?: string;
    service_attended?: string; message?: string; follow_up_permission: boolean;
  }) =>
    fetch(`${BASE}/public/visitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

// ── Admin API (requires bearer token) ───────────────────────

export function adminApi(token: string) {
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const adm = (path: string, init?: RequestInit) =>
    fetch(`${BASE}/admin${path}`, { headers: h, ...init });

  return {
    overview: () => adm("/overview").then((r) => r.json()),

    // Members
    members: (params?: Record<string, string>) =>
      adm("/members?" + new URLSearchParams(params ?? {})).then((r) => r.json()),

    // Birthdays (admin overview reused)
    birthdayOverview: () => adm("/birthdays/overview").then((r) => r.json()),

    // Photo submissions
    pendingPhotos: () =>
      fetch(`${BASE}/admin/photo-submissions?status=pending`, { headers: h }).then((r) => r.json()),
    reviewPhoto: (id: string, approve: boolean, notes?: string) =>
      adm(`/photo-submissions/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ approve, notes: notes ?? null }),
      }).then((r) => r.json()),

    // Registrations
    pendingRegistrations: () =>
      fetch(`${BASE}/admin/registrations?status=pending`, { headers: h }).then((r) => r.json()),
    approveRegistration: (id: string) =>
      adm(`/registrations/${id}/approve`, { method: "POST" }).then((r) => r.json()),
    rejectRegistration: (id: string, reason?: string) =>
      adm(`/registrations/${id}/reject`, { method: "POST" }).then((r) => r.json()),

    // Activities
    activities: (params?: Record<string, string>) =>
      adm("/activities?" + new URLSearchParams(params ?? {})).then((r) => r.json()),
    createSeries: (data: object) =>
      adm("/activities/series", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
    createOccurrence: (data: object) =>
      adm("/activities/occurrences", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
    updateOccurrence: (id: string, data: object) =>
      adm(`/activities/occurrences/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
    publishOccurrence: (id: string) =>
      adm(`/activities/occurrences/${id}/publish`, { method: "POST" }).then((r) => r.json()),
    submitReport: (id: string, data: object) =>
      adm(`/activities/occurrences/${id}/report`, { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),

    // Monthly Word
    monthlyWordList: () => adm("/monthly-word").then((r) => r.json()),
    createMonthlyWord: (data: object) =>
      adm("/monthly-word", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
    updateMonthlyWord: (id: string, data: object) =>
      adm(`/monthly-word/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),

    // Sermons
    sermonList: () => adm("/sermons").then((r) => r.json()),
    createSermon: (data: object) =>
      adm("/sermons", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
    updateSermon: (id: string, data: object) =>
      adm(`/sermons/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),
    archiveSermon: (id: string) =>
      adm(`/sermons/${id}`, { method: "DELETE" }).then((r) => r.json()),

    // Announcements
    announcementList: () => adm("/announcements").then((r) => r.json()),
    createAnnouncement: (data: object) =>
      adm("/announcements", { method: "POST", body: JSON.stringify(data) }).then((r) => r.json()),
    updateAnnouncement: (id: string, data: object) =>
      adm(`/announcements/${id}`, { method: "PATCH", body: JSON.stringify(data) }).then((r) => r.json()),

    // Departments
    departmentList: () => adm("/departments").then((r) => r.json()),
    createDepartment: (name: string, description?: string, meeting_schedule?: string) =>
      adm(
        `/departments?name=${encodeURIComponent(name)}${description ? `&description=${encodeURIComponent(description)}` : ""}${meeting_schedule ? `&meeting_schedule=${encodeURIComponent(meeting_schedule)}` : ""}`,
        { method: "POST" }
      ).then((r) => r.json()),

    // Visitors
    visitors: (status?: string) =>
      adm("/visitors" + (status ? `?status=${status}` : "")).then((r) => r.json()),
    updateVisitorStatus: (id: string, status: string) =>
      adm(`/visitors/${id}/status?follow_up_status=${status}`, { method: "PATCH" }).then((r) => r.json()),
  };
}
