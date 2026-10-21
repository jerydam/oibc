-- Deny by default; the FastAPI backend (owner role) does the authorization.
alter table roles enable row level security;
alter table profiles enable row level security;
alter table departments enable row level security;
alter table members enable row level security;
alter table member_departments enable row level security;
alter table birthday_preferences enable row level security;
alter table member_photo_submissions enable row level security;
alter table member_registration_requests enable row level security;
alter table website_settings enable row level security;
alter table audit_logs enable row level security;

revoke all on public_birthdays from anon, authenticated;

-- Self-access (defence in depth if the Supabase client is ever used directly)
create policy profiles_self on profiles for select to authenticated
  using (auth_user_id = auth.uid());
create policy members_self on members for select to authenticated
  using (profile_id in (select id from profiles where auth_user_id = auth.uid()));
create policy prefs_self on birthday_preferences for select to authenticated
  using (member_id in (select m.id from members m join profiles p on p.id = m.profile_id
                       where p.auth_user_id = auth.uid()));
