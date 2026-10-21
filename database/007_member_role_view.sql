-- Migration 007: expose role name on member queries
-- Run this against your Supabase SQL editor (or psql).
-- It adds a helper view used by the admin /members list
-- so the frontend can display each member's system role.

-- ── 1. Members with role view ─────────────────────────────────
-- Used by GET /api/admin/members to include role info.

create or replace view admin_members_with_role as
select
  m.id,
  m.member_number,
  m.full_name,
  m.preferred_display_name,
  m.membership_status,
  m.profile_photo_path,
  m.profile_photo_status,
  m.date_joined,
  m.date_of_birth,
  m.phone,
  m.email,
  m.address,
  m.admin_notes,
  m.created_at,
  m.updated_at,
  -- Login / role info (null when member has no login account yet)
  p.id           as profile_id,
  p.status       as account_status,
  r.name         as role,
  (p.id is not null) as has_login
from members m
left join profiles p on p.id = m.profile_id
left join roles    r on r.id = p.role_id;

-- RLS: only service-role or profiles with members:read can select
-- (The view inherits the underlying table's RLS.)

comment on view admin_members_with_role is
  'Admin view of members joined with their system profile and role.';
