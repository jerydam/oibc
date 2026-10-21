# Add members_ext router to main.py

Open `backend/app/main.py` (or wherever you call `app.include_router`) and add:

```python
from app.api.routes.members_ext import router as members_ext_router

app.include_router(members_ext_router)
```

That registers these endpoints:
  GET  /api/admin/roles
  POST /api/admin/members/invite
  PATCH /api/admin/members/{id}/role

## Environment variables required for invite emails

Add to your backend `.env`:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is in your Supabase dashboard → Settings → API.
It is NEVER exposed to the frontend.

## How the invite flow works

1. Admin fills the "Invite" form → POST /api/admin/members/invite
2. Backend creates the member record in the `members` table
3. Backend calls Supabase Auth Admin API: POST /auth/v1/admin/invite
4. Supabase sends the member an email with a magic link
5. Member clicks the link → lands on your site → sets a password
6. Supabase auth trigger fires → profile row created with the assigned role
7. Profile is linked to the member record (profile_id)
8. Member can now log in and see the member portal

## Supabase Auth hook (recommended)

In the Supabase dashboard → Authentication → Hooks, add a "After user created" 
SQL hook or Edge Function to automatically link the new auth user to their 
member record using the `member_id` passed in the invite metadata:

```sql
-- Example: link profile to member on sign-up
create or replace function link_profile_to_member()
returns trigger language plpgsql security definer as $$
declare
  _member_id uuid;
  _role_name  text;
  _role_id    uuid;
begin
  -- Read metadata set during invite
  _member_id := (new.raw_user_meta_data->>'member_id')::uuid;
  _role_name  := coalesce(new.raw_user_meta_data->>'role_name', 'member');

  select id into _role_id from public.roles where name = _role_name;

  insert into public.profiles (auth_user_id, display_name, email, role_id)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, _role_id)
  on conflict (auth_user_id) do nothing;

  if _member_id is not null then
    update public.members
       set profile_id = (select id from public.profiles where auth_user_id = new.id)
     where id = _member_id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure link_profile_to_member();
```
