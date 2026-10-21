-- ============================================================
-- 008  Member profile-edit requests
--      Members submit change requests; admins approve/reject.
-- ============================================================

create table member_profile_edit_requests (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references members(id) on delete cascade,
  submitted_by uuid references profiles(id),   -- the member's own profile
  -- The fields the member wants to change (all optional)
  full_name               text,
  preferred_display_name  text,
  phone                   text,
  email                   text,
  address                 text,
  date_of_birth           date,
  -- Member may include a note explaining why
  request_notes           text,
  -- Workflow
  status       text not null default 'pending'
                 check (status in ('pending','approved','rejected')),
  reviewed_by  uuid references profiles(id),
  reviewed_at  timestamptz,
  review_notes text,
  created_at   timestamptz not null default now()
);

create index profile_edit_requests_member_idx on member_profile_edit_requests (member_id);
create index profile_edit_requests_status_idx on member_profile_edit_requests (status);

-- RLS: deny-by-default (backend uses service/owner role)
alter table member_profile_edit_requests enable row level security;

-- Members can see only their own requests via the self-read policy
create policy edit_req_self_read on member_profile_edit_requests
  for select to authenticated
  using (member_id in (
    select m.id from members m
    join profiles p on p.id = m.profile_id
    where p.auth_user_id = auth.uid()
  ));
