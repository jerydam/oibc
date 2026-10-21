create extension if not exists pgcrypto;

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role_id uuid references roles(id),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  meeting_schedule text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence member_number_seq start 1;

create table members (
  id uuid primary key default gen_random_uuid(),
  member_number text unique not null
    default ('MBR-' || lpad(nextval('member_number_seq')::text, 5, '0')),
  profile_id uuid unique references profiles(id) on delete set null,
  full_name text not null,
  preferred_display_name text,
  date_of_birth date,
  birth_month int generated always as (extract(month from date_of_birth)::int) stored,
  birth_day   int generated always as (extract(day from date_of_birth)::int) stored,
  phone text,
  email text,
  address text,
  date_joined date,
  membership_status text not null default 'pending'
    check (membership_status in ('pending','active','inactive','transferred','deceased')),
  profile_photo_path text,
  profile_photo_status text not null default 'none'
    check (profile_photo_status in ('none','pending','approved','rejected')),
  profile_photo_updated_at timestamptz,
  profile_photo_updated_by uuid references profiles(id),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index members_birthday_idx on members (birth_month, birth_day);
create index members_name_idx on members (lower(full_name));
create index members_phone_idx on members (phone);
create index members_email_idx on members (lower(email));

create table member_departments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  department_id uuid not null references departments(id) on delete cascade,
  role_in_department text,
  joined_at date not null default current_date,
  left_at date,
  status text not null default 'active' check (status in ('active','left'))
);
create unique index member_dept_active_uq on member_departments (member_id, department_id) where status = 'active';

create table birthday_preferences (
  id uuid primary key default gen_random_uuid(),
  member_id uuid unique not null references members(id) on delete cascade,
  public_birthday_name_allowed boolean not null default false,
  public_photo_allowed boolean not null default false,
  public_birthday_date_allowed boolean not null default false,
  announcement_design_allowed boolean not null default false,
  gallery_photo_allowed boolean not null default false,
  birthday_contact_preference text,
  consent_recorded_at timestamptz,
  updated_at timestamptz not null default now()
);

create table member_photo_submissions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by uuid references profiles(id),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_notes text
);

create table member_registration_requests (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','needs_correction')),
  review_notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  member_id uuid references members(id),
  created_at timestamptz not null default now()
);

create table website_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id bigserial primary key,
  actor_user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index audit_entity_idx on audit_logs (entity_type, entity_id);

create trigger t_profiles_upd before update on profiles for each row execute function set_updated_at();
create trigger t_members_upd before update on members for each row execute function set_updated_at();
create trigger t_departments_upd before update on departments for each row execute function set_updated_at();
create trigger t_prefs_upd before update on birthday_preferences for each row execute function set_updated_at();

-- Public, consent-filtered birthday source. Exposes month/day only, never full date of birth.
create view public_birthdays as
select
  m.id,
  coalesce(m.preferred_display_name, m.full_name) as display_name,
  case when bp.public_photo_allowed and m.profile_photo_status = 'approved'
       then m.profile_photo_path end as photo_path,
  m.birth_month,
  m.birth_day,
  bp.public_birthday_date_allowed as date_allowed,
  (select d.name from member_departments md
     join departments d on d.id = md.department_id
    where md.member_id = m.id and md.status = 'active'
    order by md.joined_at limit 1) as department
from members m
join birthday_preferences bp on bp.member_id = m.id
where m.membership_status = 'active'
  and m.date_of_birth is not null
  and bp.public_birthday_name_allowed;
