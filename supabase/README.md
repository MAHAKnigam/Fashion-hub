# Fashion Hub backend setup

The application uses Supabase Auth, PostgreSQL, Row Level Security and Edge Functions. Razorpay checkout is created and verified server-side. Currency is INR; all database and Razorpay amounts are integer paise.

## 1. Create the Supabase project

Create a project at https://supabase.com/dashboard. In Project Settings / API, copy the Project URL and publishable key (or legacy anon key). Never put the service-role key, Razorpay secret, or database password in browser code or Git.

## 2. Apply the database migrations

In Supabase Dashboard → SQL Editor, apply these files in order:

1. `supabase/migrations/202611180001_initial_schema.sql`
2. `supabase/migrations/202611180002_checkout_indexes.sql`
3. `supabase/migrations/202611190001_atomic_stock_reservations.sql`

The migrations create the commerce schema, indexes, Row Level Security policies and atomic stock-reservation functions. Order, payment and stock-reservation writes are intentionally restricted to trusted Edge Functions. Do not deploy the updated checkout functions before applying all three migrations.

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
- Apply the atomic stock-reservation migration before deploying the updated checkout functions. Stock is reserved for 15 minutes, released on payment failure, and committed after a captured payment. Expired reservations are cleaned up whenever a new checkout starts.
- For automatic cleanup even when no new checkout starts, enable the Supabase `pg_cron` extension, then run this once in the SQL Editor:
  ```sql
  select cron.schedule(
    'fashion-hub-expire-stock-reservations',
    '*/5 * * * *',
    $select public.expire_stock_reservations();$
  );
  ```
  The function is also called automatically whenever a new checkout begins.
- Test simultaneous attempts to buy the last unit, payment failure, checkout abandonment/expiry, late payment capture and duplicate/out-of-order webhooks in Razorpay Test Mode.
- Configure shipping/tax rules, refunds, support handling and operational policies before production.

The Edge Functions currently use zero shipping charge. The updated GitHub branch is not live until its database migration and Edge Functions are applied/deployed in Supabase.
