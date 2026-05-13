# Secco Lead Capture — Junior Web Developer Assessment

A minimal lead capture application built with **Next.js App Router**, **TypeScript**, **Supabase**, and **Tailwind CSS**.

Visitors can submit their information through a public form, leads are saved to Supabase, and each successful submission is forwarded server-side to the provided webhook endpoint. An internal `/leads` page lists all submitted leads in a simple table.

**Live demo:** [secco-assessment.vercel.app](https://secco-assessment.vercel.app)  
**GitHub repo:** [github.com/kcibak/Secco-Assessment](https://github.com/kcibak/Secco-Assessment)

---

## Pages & API

| Route | Description |
|---|---|
| `/` | Public lead capture form |
| `/leads` | Server-rendered table of all submitted leads, sorted by most recent |
| `/api/leads` | POST endpoint that validates submissions, saves leads to Supabase, and forwards them to the webhook |


## Features

- Public lead capture form with required and optional fields
- Client-side validation with clear inline error states
- Server-side validation before database insert
- Server-side allowed source validation and field length limits
- Supabase persistence using a protected server-side client
- Server-side webhook forwarding after a successful Supabase insert
- Graceful webhook failure handling
- Duplicate email handling
- Loading and success states
- Internal leads table sorted by newest submission first
- Supabase RLS enabled with insert-only access for anonymous users; reads require server-side access


## How it works

1. A visitor submits the lead form on `/`.
2. Client-side validation checks required fields and email format.
3. The form sends a `POST` request to `/api/leads`.
4. The API route validates the payload again server-side.
5. The lead is inserted into Supabase using the service role key.
6. After the database insert succeeds, the lead is POSTed server-side to the provided webhook endpoint.
7. The webhook request includes the required `X-Candidate-Name` header.
8. If the webhook fails, the error is logged, but the user still sees a successful submission because the primary action already succeeded.
9. The `/leads` page fetches submitted leads server-side and renders them in a table.

---

## Webhook confirmation

This app POSTs each successfully saved lead to the provided webhook endpoint server-side, after the Supabase insert succeeds.

The webhook request includes:

```http
X-Candidate-Name: Kira Cibak
```

Webhook endpoint: https://webhook-receiver-flax.vercel.app/api/lead-webhook

If the webhook request fails, the error is logged on the server, but the user still receives a success confirmation.

---

## Supabase RLS

Supabase Row Level Security is enabled for the `leads` table.

Anonymous clients cannot read leads directly from the browser. The RLS policy allows anonymous inserts, while reads are handled through server-side code using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS only on the server.

See `init.sql` for the table definition and RLS policy setup.

---

## Running locally

```bash
git clone https://github.com/kcibak/Secco-Assessment.git
cd Secco-Assessment
cd secco-lead-capture
npm install
npm run dev
```

Create a `.env.local` in the root with the following — all values are found in your Supabase project under **Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Then run the SQL in `init.sql` against your Supabase project via the SQL Editor to create the `leads` table and apply RLS policies.

### 3. Set up the database

Run the SQL from `init.sql` in the Supabase SQL Editor. This creates the `leads` table and applies the required RLS setup.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** — Postgres database and RLS
- **Vercel** — deployment

Bootstrapped with:

```bash
npx create-next-app@latest secco-lead-capture --typescript --tailwind --eslint --app
```

---

## Deployment notes

The app is deployed on Vercel. Environment variables are configured in the Vercel project dashboard under **Settings → Environment Variables**.

An early build issue occurred due to output directory configuration, resolved by adding a `vercel.json` file and correcting the deployment settings.

---

## AI tools used

AI tools were used to support development, debugging, and review:

- ChatGPT
- GitHub Copilot
- Codex
- CodeRabbit

All generated code and suggestions were reviewed and adjusted manually before submission.

---

## What I'd improve with more time

- **Responsive polish** — the core layout works, but I would spend more time refining spacing, sizing, and mobile states
- **Input normalization** — trim whitespace and normalize casing where appropriate
- **Duplicate handling UX** — duplicate emails are handled, but the user-facing message could be more polished
- **Webhook retry logic** — failed webhook requests are logged, but a retry queue or exponential backoff would make the side effect more reliable
- **Test coverage** — integration tests around `/api/leads`, duplicate submissions, validation errors, and the webhook failure path

This implementation was intentionally kept minimal and focused on correctness: a working submission flow, protected database access, server-side webhook forwarding, and a clear review path.
