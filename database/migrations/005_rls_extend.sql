-- Enable RLS on new tables (FastAPI owner role authorises; no direct anon/authenticated reads)
alter table activity_categories      enable row level security;
alter table activities               enable row level security;
alter table activity_occurrences     enable row level security;
alter table activity_reports         enable row level security;
alter table event_registrations      enable row level security;
alter table monthly_word_prayer      enable row level security;
alter table sermons                  enable row level security;
alter table announcements            enable row level security;
alter table gallery_albums           enable row level security;
alter table gallery_media            enable row level security;
alter table media_member_tags        enable row level security;
alter table visitors                 enable row level security;

-- Allow server role (the FastAPI DB user) full access — deny everything else
-- In Supabase: the service_role bypasses RLS; the anon / authenticated roles are blocked.
-- No additional policies needed beyond enabling RLS, because our backend connects as the
-- database owner / service_role which bypasses RLS by default in Supabase.