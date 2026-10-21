-- ============================================================
-- 004  Activities, Monthly Word & Prayer, Sermons,
--      Announcements, Gallery, Visitors
-- ============================================================

-- ── Activity categories ──────────────────────────────────────
create table if not exists activity_categories (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  created_at timestamptz not null default now()
);

insert into activity_categories (name) values
  ('Sunday Worship Service'),('Bible Study'),('Prayer Meeting'),
  ('Youth Fellowship'),('Choir Rehearsal'),('Workers Meeting'),
  ('Evangelism and Outreach'),('Church Anniversary'),
  ('Easter Celebration'),('Christmas Celebration'),
  ('Annual Thanksgiving'),('Convention and Conference'),
  ('Children''s Program'),('Welfare Activity'),
  ('Departmental Meeting'),('Special Service')
on conflict (name) do nothing;

-- ── Activities (series definition) ───────────────────────────
create table if not exists activities (
  id                       uuid primary key default gen_random_uuid(),
  title                    text not null,
  category_id              uuid references activity_categories(id),
  description              text,
  organizing_department_id uuid references departments(id),
  recurrence_rule          text,   -- NULL=one-off; 'WEEKLY', 'MONTHLY', etc.
  default_venue            text,
  status                   text not null default 'active'
                             check (status in ('active','archived')),
  visibility               text not null default 'public'
                             check (visibility in ('public','members_only','private')),
  created_by               uuid references profiles(id),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── Activity occurrences ──────────────────────────────────────
create table if not exists activity_occurrences (
  id                    uuid primary key default gen_random_uuid(),
  activity_id           uuid not null references activities(id) on delete cascade,
  title                 text,           -- per-occurrence override
  start_at              timestamptz not null,
  end_at                timestamptz,
  venue                 text,
  description           text,
  cover_image_path      text,
  occurrence_status     text not null default 'scheduled'
                          check (occurrence_status in
                            ('draft','scheduled','published','completed','cancelled','archived')),
  registration_required boolean not null default false,
  registration_deadline timestamptz,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists ao_start_idx  on activity_occurrences (start_at);
create index if not exists ao_status_idx on activity_occurrences (occurrence_status);
create index if not exists ao_activity_idx on activity_occurrences (activity_id);

-- ── Activity reports ─────────────────────────────────────────
create table if not exists activity_reports (
  id                      uuid primary key default gen_random_uuid(),
  activity_occurrence_id  uuid unique not null
                            references activity_occurrences(id) on delete cascade,
  report_summary          text,
  attendance_total        int,
  outcomes                text,
  challenges              text,
  follow_up_actions       text,
  submitted_by            uuid references profiles(id),
  submitted_at            timestamptz not null default now(),
  status                  text not null default 'draft'
                            check (status in ('draft','submitted','approved'))
);

-- ── Event registrations ───────────────────────────────────────
create table if not exists event_registrations (
  id                     uuid primary key default gen_random_uuid(),
  activity_occurrence_id uuid not null references activity_occurrences(id) on delete cascade,
  member_id              uuid references members(id),
  guest_name             text,
  guest_email            text,
  guest_phone            text,
  status                 text not null default 'registered'
                           check (status in ('registered','cancelled','attended')),
  registered_at          timestamptz not null default now()
);
create unique index if not exists event_reg_member_uq
  on event_registrations (activity_occurrence_id, member_id)
  where member_id is not null;

-- ── Monthly Word & Prayer ─────────────────────────────────────
create table if not exists monthly_word_prayer (
  id                   uuid primary key default gen_random_uuid(),
  month                int  not null check (month between 1 and 12),
  year                 int  not null check (year >= 2000),
  title                text not null,
  pastor_name          text,
  video_url            text,
  thumbnail_path       text,
  message_description  text,
  prayer_focus         text,
  scripture_reference  text,
  prayer_points        jsonb not null default '[]',   -- array of strings
  publication_status   text not null default 'draft'
                         check (publication_status in ('draft','published','archived')),
  published_at         timestamptz,
  created_by           uuid references profiles(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (year, month)   -- one primary edition per calendar month
);

-- ── Sermons ───────────────────────────────────────────────────
create table if not exists sermons (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  preacher_name      text,
  sermon_date        date,
  scripture_reference text,
  category           text,
  description        text,
  video_url          text,
  audio_url          text,
  thumbnail_path     text,
  publication_status text not null default 'draft'
                       check (publication_status in ('draft','published','archived')),
  created_by         uuid references profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists sermons_date_idx on sermons (sermon_date desc);

-- ── Announcements ─────────────────────────────────────────────
create table if not exists announcements (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  body            text not null,
  target_audience text not null default 'public'
                    check (target_audience in ('public','members','department','leadership')),
  department_id   uuid references departments(id),
  image_path      text,
  published_at    timestamptz,
  expires_at      timestamptz,
  status          text not null default 'draft'
                    check (status in ('draft','published','expired','archived')),
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists ann_status_idx on announcements (status, published_at desc);

-- ── Gallery ───────────────────────────────────────────────────
create table if not exists gallery_albums (
  id                     uuid primary key default gen_random_uuid(),
  title                  text not null,
  description            text,
  activity_occurrence_id uuid references activity_occurrences(id),
  album_date             date,
  visibility             text not null default 'public'
                           check (visibility in ('public','members_only','private')),
  cover_image_path       text,
  created_by             uuid references profiles(id),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists gallery_media (
  id                 uuid primary key default gen_random_uuid(),
  album_id           uuid not null references gallery_albums(id) on delete cascade,
  file_path          text not null,
  media_type         text not null default 'image'
                       check (media_type in ('image','video')),
  caption            text,
  display_order      int not null default 0,
  publication_status text not null default 'published'
                       check (publication_status in ('published','archived')),
  created_by         uuid references profiles(id),
  created_at         timestamptz not null default now()
);

-- Member tags in gallery photos
create table if not exists media_member_tags (
  id              uuid primary key default gen_random_uuid(),
  media_id        uuid not null references gallery_media(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  tagged_by       uuid references profiles(id),
  approval_status text not null default 'approved'
                    check (approval_status in ('pending','approved','rejected')),
  created_at      timestamptz not null default now(),
  unique (media_id, member_id)
);

-- ── Visitors ──────────────────────────────────────────────────
create table if not exists visitors (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text,
  phone               text,
  visit_date          date not null default current_date,
  service_attended    text,
  message             text,
  follow_up_permission boolean not null default false,
  follow_up_status    text not null default 'new'
                        check (follow_up_status in
                          ('new','contacted','converted','closed','no_response')),
  assigned_to         uuid references profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Departments: add leader fields ───────────────────────────
alter table departments
  add column if not exists leader_member_id           uuid references members(id),
  add column if not exists assistant_leader_member_id uuid references members(id);

-- ── Triggers ─────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 't_activities_upd') then
    create trigger t_activities_upd before update on activities
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 't_ao_upd') then
    create trigger t_ao_upd before update on activity_occurrences
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 't_mwp_upd') then
    create trigger t_mwp_upd before update on monthly_word_prayer
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 't_sermons_upd') then
    create trigger t_sermons_upd before update on sermons
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 't_ann_upd') then
    create trigger t_ann_upd before update on announcements
      for each row execute function set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 't_visitors_upd') then
    create trigger t_visitors_upd before update on visitors
      for each row execute function set_updated_at();
  end if;
end $$;