# EB Chemical Supabase Persistence

This backend keeps local development working with `backend/src/data-store/store.json` and `backend/uploads`.
In production, set Supabase environment variables so data and uploaded images persist after redeploys.

## 1. Create Supabase resources

1. Create a Supabase project.
2. Open **SQL Editor** and run `backend/supabase/schema.sql`.
3. Open **Storage** and create a public bucket, for example:
   `eb-chemical-uploads`

The backend uses the service role key server-side only. Do not expose it in frontend code.

## 2. Environment variables

Set these on the backend deployment, including Vercel if the backend is deployed there:

```env
SUPABASE_URL=https://hmugkuhbsqbdbnoqhcsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
SUPABASE_BUCKET=eb-chemical-uploads
```

For local development, create `backend/.env` and paste the real values there.
`backend/.env` is ignored by git and must not be committed.

Keep local development without these variables if you want to use the local JSON fallback.

## 3. Preserve current live production data before redeploy

If staff/products/orders were added from the live website before Supabase was configured, export them before replacing that deployment.

Preferred full export, available after this backend version is deployed:

```bash
cd backend
npm run export:live -- https://YOUR_BACKEND_URL/api admin@epchemical.com admin-password live-store-export.json
```

If the current live backend does not have `/api/admin/export-store`, the script falls back to the existing public/admin endpoints. That fallback can export products, orders, employees, reviews, offers, category cards, and work sessions exposed by the current API. Customer accounts that are not exposed by the current API may need a full server-side `store.json` backup.

## 4. Import data into Supabase

After creating the schema and setting local `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, run:

```bash
cd backend
npm run migrate:supabase -- live-store-export.json
```

By default, migration is merge-only and does not delete rows already in Supabase.
To intentionally replace Supabase rows that are missing from the file:

```bash
npm run migrate:supabase -- live-store-export.json --prune
```

Use `--prune` only when the export file is known to be the complete source of truth.

## 5. Deploy

Set the Supabase environment variables in Vercel/backend hosting before redeploy:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`

In Vercel, add them in the backend project's **Settings -> Environment Variables**.
Use the same variable names exactly. Do not prefix them with `VITE_`.

When these variables exist:

- Products, staff/users, orders, variants, gallery images, carts, reviews, homepage offers, category cards, and work sessions are loaded from Supabase PostgreSQL.
- Uploaded images are saved to Supabase Storage and returned as permanent public URLs.
- `store.json` is not used as the production source of truth.
- `backend/uploads` is only a local fallback.

## 6. Persistence test

After deployment:

1. Add a product from Admin.
2. Add at least one variant with color, size, price, and stock.
3. Upload a main/gallery image.
4. Add a staff member.
5. Create an order.
6. Redeploy the backend/frontend.
7. Confirm the product, variant, uploaded image URL, staff member, and order still appear.

If data disappears, check that all three Supabase env vars are present in the deployed backend runtime, not only the frontend.
