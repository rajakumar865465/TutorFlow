-- Add new settings columns to tutor_profiles
-- These columns extend the existing profile with AI, makeup, and notification preferences.

-- Free-form text for the tutor's makeup-lesson policy
ALTER TABLE public.tutor_profiles
  ADD COLUMN IF NOT EXISTS makeup_policy TEXT;

-- AI-related settings (auto-generate summaries, tone, model preference)
ALTER TABLE public.tutor_profiles
  ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
    "auto_generate_summaries": true,
    "summary_tone": "professional"
  }'::jsonb;

-- Expanded notification preferences (lesson reminders + activity notifications)
ALTER TABLE public.tutor_profiles
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
    "email_24h_reminder": true,
    "email_same_day_reminder": false,
    "email_student_reminder": false,
    "email_new_booking": true,
    "email_cancellation": true,
    "email_payment_received": true,
    "email_weekly_summary": false,
    "push_enabled": false
  }'::jsonb;
