# Order Kaaro

The online shop for Order Kaaro, a grocery store in Kishanganj. Customers pick items on their phone, the order is saved, and it is sent to the shop on WhatsApp. They pay cash or UPI on delivery. The shop owner runs everything (products, prices, stock, orders, coupons, opening hours) from the admin panel at `/admin`.

- **Part 1** is for the shop owner and staff: how to use the admin panel. No technical knowledge needed.
- **Part 2** is for developers: setup, database, tests and deployment.

---

# Part 1 — Admin guide

## Logging in

1. Open your shop's address followed by `/admin` (for example `https://your-shop.com/admin`) in Chrome on your phone or computer.
2. Enter your email and password and tap **Sign in**.
3. Forgot your password? Tap **Forgot password?** and follow the link that arrives by email.

For safety you are logged out after 30 minutes without activity. Staff accounts can manage orders and products. Only the **owner** can add or remove admins and change certain store settings.

**Tip:** in Chrome, tap ⋮ → **Add to Home screen**. The admin then opens like an app.

## Turning on new-order alerts

Tap **Alerts** (the bell) at the top of the admin and allow notifications when Chrome asks. New orders then make a sound and show a notification while the admin is open. The bell turns green when alerts are on. Do this once on each phone or computer you use.

## Handling orders (Orders tab)

New orders appear at the top within a few seconds, marked **New**.

1. Tap an order to open it. You'll see the items, the customer's name, address and landmark, and the total.
2. Use **Call** or **WhatsApp customer** if you need to check anything.
3. Move the order along with the big button:
   **Confirm order** → **Mark out for delivery** → **Mark delivered**.
4. **Edit items** (new or confirmed orders only): change quantities or remove items the customer no longer wants, or items you don't have. The total, delivery fee, coupon and stock update automatically.
5. **Cancel order** if it can't be delivered. Any stock is put back.
6. **Packing slip** opens a printable slip with the items and address.

Prices on an order are fixed when it is placed. Changing a product's price later does not change existing orders.

## Products (Products tab)

- **Search** by name, or filter by category or "out of stock".
- **In stock** switch: turn it off when an item runs out. Customers then see "Out of stock" and can't order it.
- **Show in shop**: turn this off to hide a product without deleting it.
- **Add product**: enter the English and Hindi names, a category, then one or more **sizes** (for example 1 kg, 5 kg), each with its **Price ₹** and optional **MRP ₹**. The MRP must be at least the price. Customers see the saving.
- **Photos**: tap to add a photo from your phone or camera. It is shrunk automatically so the shop stays fast. The first photo is the main one.
- **Count stock** (optional, per size): enter **Units in stock**. Stock goes down with each order and the item shows out of stock at 0. **Warn when at or below** shows a low-stock warning on your dashboard.
- **Max per order**: the most of that size one customer can order.
- **Featured on home page**: shows the product in "Daily essentials" on the home page.
- **Search words**: extra words customers might type, such as "toor" or "tuvar" for arhar dal.
- **Change many prices at once**: tick the products, then tap **Change prices**. You can raise or lower prices by an amount or a percentage, and see the change before saving. Every price change is recorded in the product's price history.
- **Export CSV / Import CSV**: download all products as a spreadsheet, edit prices or stock in Excel or Google Sheets, and upload it again. Nothing is saved unless every row is correct; any mistakes are listed by row number.

## Categories (Categories tab)

Add, rename (English and Hindi), choose an icon, reorder with the arrows, or hide a category. A category can only be deleted once it has no products.

## More tab

- **Store settings**:
  - **Open / Closed** switch. When closed, customers can browse but checkout is blocked and they see your "message while closed".
  - **Store hours** for each day.
  - **Delivery fees**: the fee for each order amount, for example free from ₹800.
  - **Minimum order** and **delivery pincodes** (leave empty to accept any).
  - **Announcement**: a short banner shown at the top of the shop.
  - **WhatsApp number that receives orders**, phone numbers, email, address and Google review link.
- **Coupons**: create a code (for example `DIWALI50`), choose a percentage or flat discount, a minimum order, optional dates and usage limits, and switch it on or off. You can see how often each code has been used.
- **Customers**: everyone who has ordered, grouped by phone number, with order count and total spent.
- **Admins** (owner only): add a staff member by email after creating their login in Supabase. You can also remove admins. The last owner can't be removed.
- **Activity log**: who changed what and when (prices, stock, settings, orders).

## Dashboard (Home tab)

Today's orders and sales, orders waiting for action, low-stock items, and a 30-day chart of orders.

## If something goes wrong

- **The shop shows "We couldn't reach our system" at checkout**: the database is unreachable. Customers can still send their order on WhatsApp. Those orders aren't in the admin, so handle them from WhatsApp.
- **A price or stock change doesn't show on a customer's phone**: it appears within a few seconds while the shop is open on their phone. Otherwise it appears the next time they open it.
- **A customer sees "A new version of Order Kaaro is ready"**: the website was updated. Tapping **Refresh** loads the new version.

---

# Part 2 — Developer guide

## Stack

- React 18, TypeScript, Vite 5 and Tailwind CSS. Design tokens are in [docs/design-system.md](docs/design-system.md).
- Supabase (Postgres, Auth, Storage, Realtime). Row level security is on every table. Orders are written only through the `place_order` function, which re-prices the cart, checks stock and coupons, and rate-limits.
- Hosted on Vercel. `api/` holds two small functions, for `/sitemap.xml` and `/robots.txt`.
- Customer site: `src/pages`, `src/ui`, `src/data`. Admin panel: `src/admin`, loaded only on `/admin`. Shared money rules: `src/lib/pricing.ts`.

## Setup

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
npm run dev
```

`.env`:

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser, Vercel | Project URL |
| `VITE_SUPABASE_ANON_KEY` | browser, Vercel | Public anon key; row level security protects the data |
| `VITE_SITE_URL` | build (optional) | Full shop address for link previews; on Vercel the production domain is used automatically |
| `SUPABASE_SERVICE_ROLE_KEY` | local scripts only | Full database access. **Never** prefix with `VITE_`, never add to Vercel, never commit |

## Database

Follow [docs/supabase-setup.md](docs/supabase-setup.md) for creating the project, applying `supabase/migrations` and `supabase/seed.sql`, creating the owner account and the auth redirect URLs.

- The live project's migrations were applied by hand in the SQL Editor, so the CLI history is empty. Before your first `supabase db push`, run `supabase migration repair --status applied <version>` for each existing migration.
- After changing the schema, regenerate the TypeScript types with `npm run db:types`.
- `npm run images:check` confirms every product photo (full size and thumbnail) loads from Storage.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm run preview` | Production build, served at http://localhost:4173 |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |
| `npm test` | Unit and database tests (Vitest; the database tests run the real migrations in an in-process Postgres, PGlite, so no Docker is needed) |
| `npm run test:e2e` | Playwright tests on a phone-sized screen, using the installed Google Chrome. They build and start the preview server automatically, read the live catalogue, and never create orders (`place_order` is intercepted). |
| `npm run orders:cleanup-tests` | Lists orders whose customer name starts with `TEST ` (add `-- --delete` to remove them) |

Before any release, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` and `npm run build` must all pass.

## Deploying (Vercel)

1. In Vercel → Project → Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Optionally add `VITE_SITE_URL`.
2. In Supabase → Authentication → URL Configuration, set the Site URL to the shop's address. Add `https://<your-domain>/admin/reset-password` to the redirect URLs.
3. Push to `main`. Vercel builds with `npm run build` and serves `dist/`. `vercel.json` holds the SPA rewrite, the sitemap/robots routes, cache headers and redirects from the old site's addresses.

## Performance and offline

- The first screen is plain HTML (generated in `vite.config.ts`), so slow phones see the shop before the app loads.
- The catalogue reads are preloaded from the HTML. The customer site uses plain `fetch` (`src/lib/rest.ts`); supabase-js loads afterwards, only for live updates.
- Fonts only download the subsets a page uses; English pages skip the Devanagari fonts.
- `public/sw.js` serves pages network-first, and hashed assets and images cache-first. The last catalogue is kept on the phone, so the shop opens offline.
- Each build writes `/version.json`; open pages offer a refresh when it changes.
- Last Lighthouse mobile scores (October 2026): Performance 99 on home, 91 on product pages, 88–89 on category pages. Accessibility, Best Practices and SEO are 100.
