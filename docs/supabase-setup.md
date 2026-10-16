# Setting up Supabase

Order Kaaro uses **one** Supabase project for both testing and the live shop. It takes about 15 minutes. Nothing here needs Docker.

## 1. Create the project

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Choose the **Mumbai (ap-south-1)** region. Save the database password somewhere safe.

(A second, separate test project is optional. If you add one later, its keys go in the `TEST_` lines of `.env` and scripts take `--test`.)

## 2. Put the keys in `.env`

1. Copy `.env.example` to `.env` in the project folder.
2. Open **Project Settings → API** and copy:
   - **Project URL** into `VITE_SUPABASE_URL`
   - **anon public** into `VITE_SUPABASE_ANON_KEY`
   - **service_role** into `SUPABASE_SERVICE_ROLE_KEY`

The service_role key can read and change everything. Keep it only in `.env` on your computer.

## 3. Turn off public sign-up

In each project: **Authentication → Sign In / Providers → Email**, switch off **Allow new users to sign up**. Admin accounts are only ever added by you (step 6).

## 4. Create the database

The project reference is the `xxxx` in `https://xxxx.supabase.co`.

```bash
npx supabase login
```

```bash
npx supabase link --project-ref your-project-ref
```

```bash
npx supabase db push --include-seed
```

This creates every table, security rule and function from `supabase/migrations`, then loads the 125 products from `supabase/seed.sql`. Running the seed again never duplicates anything.

If you prefer not to use the command line, open **SQL Editor** in Supabase and run each file in `supabase/migrations` in name order, then `supabase/seed.sql`.

## 5. Upload the product photos

```bash
npm run images:import
```

This converts the 115 photos in `public/catalog` to small WebP files (48 MB becomes about 6 MB) and uploads them to the `product-images` bucket. Then check every product photo loads:

```bash
npm run images:check:remote
```

## 6. Create the first owner account

1. In Supabase, open **Authentication → Users → Add user → Create new user**. Enter the owner's email and a strong password, and tick **Auto Confirm User**.
2. Open **SQL Editor** and run, with that email:

```sql
insert into public.admin_users (user_id, role, display_name)
select id, 'owner', 'Owner'
from auth.users
where email = 'owner@example.com';
```

The owner can add staff later from the admin panel. The database refuses to remove or demote the last owner.

## 7. Allow password-reset links

In **Authentication → URL Configuration**:
- set **Site URL** to the shop's address (for example `https://orderkaaro.in`)
- under **Redirect URLs**, add `https://<your shop address>/admin/reset-password` and, for testing on a computer, `http://localhost:4173/admin/reset-password`

Without this, "Forgot password?" emails link to the wrong place.

## What the database enforces

- Customers can read only visible products, categories and the shop settings.
- Customers can't read or write orders, coupons or admin data. Orders are created only through `place_order`. It re-prices the cart on the server, checks stock and coupons, and limits orders to 3 per phone number in 10 minutes, 10 per phone number per day, and 5 per network address in 10 minutes.
- Staff manage products, stock, photos and orders.
- Only owners change settings, coupons and admin accounts, and read the activity log.
- Every price change is recorded with who made it and when.
- Order status moves new → confirmed → out for delivery → delivered, or cancelled. Every change is timestamped. Stock on tracked items comes off when an order is confirmed and goes back if it's cancelled.

## Changing the database later

1. Add a new file to `supabase/migrations` (never edit one that has already been pushed).
2. Run `npm test` to check it against the in-memory database.
3. Run `npm run db:types` to refresh `src/lib/database.types.ts`.
4. Run `npx supabase db push`.
