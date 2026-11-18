# Fashion Hub backend setup

The application uses Supabase Auth, PostgreSQL, Row Level Security and Edge Functions. Razorpay checkout is created and verified server-side. Currency is INR; all database and Razorpay amounts are integer paise.

## 1. Create the Supabase project

Create a project at https://supabase.com/dashboard. In Project Settings / API, copy the Project URL and publishable key (or legacy anon key). Never put the service-role key, Razorpay secret, or database password in browser code or Git.

## 2. Apply the database migration

In Supabase Dashboard → SQL Editor, run the complete file:

`supabase/migrations/202611180001_initial_schema.sql`

The schema creates profiles, categories, products, addresses, orders, order_items and payments, plus Row Level Security policies. Order/payment writes are intentionally restricted to trusted Edge Functions.

## 3. Add frontend configuration

Copy `config.example.js` to `config.js` and fill in the Supabase Project URL and publishable/anon key. Keep `config.js` out of version control. This key is designed for browser use only when RLS is enabled.

## 4. Configure Edge Function secrets

Install the Supabase CLI, log in and link this project. Set secrets (never commit these values):

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SITE_URL` (the exact deployed frontend origin)

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions. Do not expose the service role key to the browser.

Deploy:
```sh
supabase functions deploy create-razorpay-order
supabase functions deploy verify-razorpay-payment
supabase functions deploy razorpay-webhook --no-verify-jwt
```

In Razorpay Dashboard → Account & Settings → Webhooks, add:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook`

Subscribe to `payment.captured` and `payment.failed`, then copy the webhook secret into the Supabase function secrets.

## 5. Important setup tasks before launch

- Import the existing product catalogue into `public.products`; convert each displayed rupee amount to paise (₹499.00 → 49900).
- Create the first admin profile manually in the SQL Editor only after signing up that account. Never grant admin based on browser storage or user-submitted metadata.
- Configure Supabase Auth email settings and allowed redirect URLs.
- Configure Razorpay test mode first. Complete successful, failed, cancelled and duplicate-webhook tests before enabling live credentials.
- Add address validation, stock reservation/decrement, shipping/tax rules, refunds and operational policies before production.

The Edge Functions currently use zero shipping charge. Do not launch until the shipping/tax policy and inventory update flow are implemented and tested.
