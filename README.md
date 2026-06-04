# EB Chemical Setup

## Supabase persistence

The backend can run in two modes:

- Local fallback mode: uses `backend/src/data-store/store.json` and `backend/uploads` when Supabase env variables are missing.
- Supabase mode: uses Supabase PostgreSQL and Supabase Storage when the variables below are present.

Do not hardcode secrets in source files. Put secrets only in local `.env` files or hosting environment variables.

### Local backend env

Create this file locally:

```text
backend/.env
```

Paste:

```env
SUPABASE_URL=https://hmugkuhbsqbdbnoqhcsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-your-real-service-role-key-here
SUPABASE_BUCKET=eb-chemical-uploads
```

`backend/.env` is ignored by git.

### Vercel env

In the backend Vercel project, open:

```text
Settings -> Environment Variables
```

Add these variables exactly:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_BUCKET
```

Use:

```env
SUPABASE_URL=https://hmugkuhbsqbdbnoqhcsm.supabase.co
SUPABASE_BUCKET=eb-chemical-uploads
```

Paste the real service role key only into the Vercel `SUPABASE_SERVICE_ROLE_KEY` value field.

### Run the database schema

In Supabase:

1. Open SQL Editor.
2. Paste and run `backend/supabase/schema.sql`.
3. Confirm the `eb-chemical-uploads` Storage bucket exists.

### Export and migrate current live data before deploy

Before redeploying over a live site that has products, staff, or orders added from the website:

```bash
cd backend
npm run export:live -- https://YOUR_BACKEND_URL/api admin@epchemical.com admin-password live-store-export.json
npm run migrate:supabase -- live-store-export.json
```

The migration command is merge-only by default and does not delete existing Supabase data.

Use `--prune` only if the export is the complete source of truth:

```bash
npm run migrate:supabase -- live-store-export.json --prune
```

