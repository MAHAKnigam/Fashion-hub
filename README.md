# Fashion Hub

Fashion Hub is a responsive fashion storefront with a static HTML, CSS and JavaScript frontend and a Supabase-backed commerce backend.

## Features

- Product catalogue for men, women and kids
- Supabase authentication and customer profiles
- Shopping cart and server-priced checkout
- Razorpay payment order creation, signature verification and webhook reconciliation
- Customer order history, order details and tracking
- Administrator order management and fulfilment status controls
- Atomic stock reservations to protect limited inventory during concurrent checkouts

## Backend setup

See [Supabase setup and deployment instructions](supabase/README.md) for database migrations, frontend configuration, Edge Function secrets, deployment commands and launch checks.

## Frontend configuration

The static website loads config.js in the browser. It contains only the Supabase project URL and public publishable/anon key, which are designed to be visible to browsers. Database access must remain protected by Row Level Security (RLS).

Never put a Supabase service-role key, Razorpay key secret, webhook secret, database password or other private credential in frontend files or Git.

If you are configuring a different Supabase project, use [config.example.js](config.example.js) as a template and update config.js with that project's public URL and publishable/anon key.

## Payments

Razorpay is configured for Test Mode. Do not enable live payments until successful, failed, cancelled, duplicate-webhook and stock-reservation edge cases have been tested and shipping, tax, refunds and support policies are ready.

## GitHub checks

The GitHub Actions workflow checks frontend JavaScript syntax and lints/type-checks Supabase Edge Functions on pull requests and pushes to the default branch.
