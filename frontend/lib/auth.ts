"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

const ADMIN_EMAIL    = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD!;
const HARDCODED_TOKEN = "hardcoded-admin-token";

export async function signIn(email: string, password: string) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return { data: { session: { access_token: HARDCODED_TOKEN }, user: null }, error: null };
  }
  return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
}

export async function signOut() {
  // Nothing to do — no real session
}

export async function getSession() {
  // Check localStorage for persisted "session"
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("admin_session");
  return stored ? JSON.parse(stored) : null;
}

export async function getToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}