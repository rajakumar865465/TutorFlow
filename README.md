# TutorFlow

AI-native scheduling and client-operations platform for independent tutors and private lesson teachers.

## Features

- **Student & Parent Management** - Track students, parent contacts, and lesson history
- **Lesson Packages** - Create packages with configurable lesson counts, pricing, and deposit options
- **Smart Scheduling** - Set weekly availability, manage recurring lessons, prevent double booking
- **Public Booking Page** - Parents book without creating an account via your unique link
- **Stripe Payments** - Secure online payments with deposit and full package options
- **Manual Payment Fallback** - Track Venmo, Zelle, cash, bank transfers, etc.
- **Email Reminders** - Booking confirmations, lesson reminders, and renewal prompts via Resend
- **Session Notes** - Write private notes after lessons
- **AI Parent Summaries** - Generate warm, professional parent-facing summaries from your rough notes
- **Makeup Credits** - Track cancellation credits and usage
- **Package Tracking** - Auto-deduct lessons, alert when 2 remain
- **Cancellation & No-Show** - Flexible policies with makeup credit creation

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (PostgreSQL, Auth, RLS)
- **Stripe** (Checkout, Webhooks)
- **Resend** (Email)
- **AI Provider** (Configurable: OpenAI, Anthropic, or compatible)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))
- A Stripe account ([stripe.com](https://stripe.com))
- A Resend account ([resend.com](https://resend.com))

### 1. Clone and Install

```bash
git clone <repo-url>
cd tutorflow
npm install
```

### 2. Set up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email address |
| `AI_PROVIDER` | `openai` or `anthropic` |
| `AI_API_KEY` | AI provider API key |
| `AI_MODEL` | Model name (e.g. `gpt-4o-mini`) |

### 3. Set up Database

Run the migration SQL in your Supabase SQL editor:

```
supabase/migrations/00001_initial_schema.sql
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 4. Configure Stripe Webhooks

In your Stripe dashboard, create a webhook endpoint pointing to:

```
https://your-domain.com/api/payments/webhook
```

Events to listen for:
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, signup, reset-password)
│   ├── (dashboard)/     # Protected tutor dashboard pages
│   ├── (public)/        # Public landing and pricing pages
│   ├── api/             # API routes
│   │   ├── ai/          # AI session summary
│   │   ├── auth/        # Auth endpoints
│   │   ├── availability/# Availability slots
│   │   ├── makeup-credits/
│   │   ├── notes/       # Session notes
│   │   ├── packages/    # Package management
│   │   ├── payments/    # Stripe + manual payments
│   │   ├── public/      # Public booking API
│   │   ├── reminders/   # Reminder scheduling & sending
│   │   ├── sessions/    # Session management
│   │   ├── students/    # Student CRUD
│   │   └── tutor/       # Tutor profile & dashboard
│   └── book/[slug]/     # Public booking pages
├── components/
│   ├── layout/          # Dashboard sidebar
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── ai.ts           # AI summary generation
│   ├── email.ts        # Resend email templates & sending
│   ├── stripe.ts       # Stripe checkout & webhook helpers
│   ├── supabase/       # Supabase client utilities
│   └── utils.ts        # Shared utilities
├── middleware.ts        # Auth middleware
└── types/
    └── database.ts     # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Database Migrations

Run the SQL in `supabase/migrations/00001_initial_schema.sql` in your Supabase project before deploying.

### Cron Job for Reminders

Set up a cron job or Vercel cron to call:

```
POST https://your-domain.com/api/reminders/send
```

This sends all pending email reminders that are due.

## License

MIT
# TutorFlow
