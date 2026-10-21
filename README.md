# Church Website & Management System

FastAPI (backend) + Next.js/TypeScript (frontend) + Supabase PostgreSQL & Auth.
This drop covers **Phase 1**: schema, auth/roles, members, birthday preferences,
photo approval, registrations, and the public birthday homepage.

```
church-platform/
├── database/migrations/      001_schema.sql  002_rls.sql  003_seed.sql
├── backend/                  FastAPI app (app/main.py)
│   └── app/{core,api/routes,schemas,services}
├── frontend/                 Next.js 14 (App Router)
│   ├── app/                  pages (placeholders for later phases)
│   ├── components/           birthday UI
│   └── lib/                  API client
└── docs/
```

## Run it
1. Supabase: create a project, then run the three SQL files in order (SQL editor).
   Create a Storage bucket `member-photos` (private) and `public-photos` (public).
2. Backend
   ```
   cd backend && cp .env.example .env   # fill in values
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
   Docs at http://localhost:8000/docs
3. Frontend
   ```
   cd frontend && cp .env.example .env.local
   npm install && npm run dev
   ```
4. First admin: sign up a user in Supabase Auth, then run:
   ```sql
   insert into profiles (auth_user_id, display_name, email, role_id)
   select '<AUTH_USER_UUID>', 'Admin', 'you@example.com', id from roles where name='super_admin';
   ```

## Privacy model
- The backend connects with the Postgres owner role; RLS is enabled as a safety net.
- Public pages read only `public_birthdays` (no date of birth, no contact data).
- Every admin endpoint checks a permission string from `roles.permissions`.
- Deploy backend on Koyeb with the included Dockerfile.
