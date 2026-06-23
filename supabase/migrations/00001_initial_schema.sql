-- TutorFlow Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TUTOR_PROFILES
-- ============================================
CREATE TABLE public.tutor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  lesson_type TEXT NOT NULL DEFAULT 'both' CHECK (lesson_type IN ('in_person', 'online', 'both')),
  default_lesson_duration INTEGER NOT NULL DEFAULT 60,
  booking_link_slug TEXT NOT NULL UNIQUE,
  cancellation_policy TEXT NOT NULL DEFAULT '24h',
  reminder_preferences JSONB DEFAULT '{"24h_reminder": true, "same_day_reminder": false, "student_reminder": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tutor_profiles_user_id ON public.tutor_profiles(user_id);
CREATE INDEX idx_tutor_profiles_slug ON public.tutor_profiles(booking_link_slug);

-- ============================================
-- STUDENTS
-- ============================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT,
  student_phone TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  lesson_type TEXT CHECK (lesson_type IN ('in_person', 'online', 'both')),
  default_duration INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_tutor_id ON public.students(tutor_id);
CREATE INDEX idx_students_parent_email ON public.students(parent_email);

-- ============================================
-- PACKAGES
-- ============================================
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lesson_count INTEGER NOT NULL CHECK (lesson_count > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  deposit_amount DECIMAL(10,2),
  lesson_duration INTEGER NOT NULL DEFAULT 60,
  makeup_credit_limit INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packages_tutor_id ON public.packages(tutor_id);

-- ============================================
-- STUDENT_PACKAGES
-- ============================================
CREATE TABLE public.student_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_lessons INTEGER NOT NULL,
  used_lessons INTEGER NOT NULL DEFAULT 0,
  remaining_lessons INTEGER NOT NULL,
  makeup_credits_total INTEGER NOT NULL DEFAULT 0,
  makeup_credits_used INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'paid_manually', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  manual_payment_method TEXT,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_packages_student_id ON public.student_packages(student_id);
CREATE INDEX idx_student_packages_tutor_id ON public.student_packages(tutor_id);

-- ============================================
-- AVAILABILITY_SLOTS
-- ============================================
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  specific_date DATE,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_tutor_id ON public.availability_slots(tutor_id);

-- ============================================
-- SESSIONS
-- ============================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_package_id UUID REFERENCES public.student_packages(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled_by_parent', 'canceled_by_tutor', 'no_show', 'rescheduled')),
  cancellation_reason TEXT,
  canceled_at TIMESTAMPTZ,
  counts_against_package BOOLEAN NOT NULL DEFAULT true,
  makeup_credit_used BOOLEAN NOT NULL DEFAULT false,
  recurrence_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_tutor_id ON public.sessions(tutor_id);
CREATE INDEX idx_sessions_student_id ON public.sessions(student_id);
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time);
CREATE INDEX idx_sessions_recurrence_id ON public.sessions(recurrence_id);

-- ============================================
-- RECURRING_SESSIONS
-- ============================================
CREATE TABLE public.recurring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_package_id UUID NOT NULL REFERENCES public.student_packages(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_sessions_tutor_id ON public.recurring_sessions(tutor_id);

-- ============================================
-- SESSION_NOTES
-- ============================================
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  private_note TEXT,
  ai_parent_summary TEXT,
  homework TEXT,
  progress_tags TEXT[] DEFAULT '{}',
  sent_to_parent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX idx_session_notes_student_id ON public.session_notes(student_id);

-- ============================================
-- REMINDERS
-- ============================================
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('parent', 'student', 'tutor')),
  recipient_email TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'booking_confirmation_parent',
    'booking_confirmation_tutor',
    'lesson_reminder_24h',
    'lesson_reminder_same_day',
    'student_reminder',
    'payment_reminder',
    'package_renewal',
    'session_summary'
  )),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_tutor_id ON public.reminders(tutor_id);
CREATE INDEX idx_reminders_scheduled_for ON public.reminders(scheduled_for);
CREATE INDEX idx_reminders_status ON public.reminders(status);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_package_id UUID REFERENCES public.student_packages(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'paid_manually')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('package', 'deposit', 'manual')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  manual_payment_method TEXT CHECK (manual_payment_method IN ('venmo', 'zelle', 'cash', 'bank_transfer', 'other')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_tutor_id ON public.payments(tutor_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);

-- ============================================
-- MAKEUP_CREDITS
-- ============================================
CREATE TABLE public.makeup_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  student_package_id UUID NOT NULL REFERENCES public.student_packages(id) ON DELETE CASCADE,
  source_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  used_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX idx_makeup_credits_tutor_id ON public.makeup_credits(tutor_id);
CREATE INDEX idx_makeup_credits_student_id ON public.makeup_credits(student_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.makeup_credits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own row
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Tutor profiles
CREATE POLICY "Tutors can view own profile" ON public.tutor_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Tutors can insert own profile" ON public.tutor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tutors can update own profile" ON public.tutor_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Public read for booking link
CREATE POLICY "Public can view booking profiles" ON public.tutor_profiles
  FOR SELECT USING (true);

-- Students
CREATE POLICY "Tutors can view own students" ON public.students
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own students" ON public.students
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own students" ON public.students
  FOR UPDATE USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can delete own students" ON public.students
  FOR DELETE USING (tutor_id = auth.uid());

-- Packages
CREATE POLICY "Tutors can view own packages" ON public.packages
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own packages" ON public.packages
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own packages" ON public.packages
  FOR UPDATE USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can delete own packages" ON public.packages
  FOR DELETE USING (tutor_id = auth.uid());

-- Public read for booking packages
CREATE POLICY "Public can view active packages" ON public.packages
  FOR SELECT USING (is_active = true);

-- Student packages
CREATE POLICY "Tutors can view own student packages" ON public.student_packages
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own student packages" ON public.student_packages
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own student packages" ON public.student_packages
  FOR UPDATE USING (tutor_id = auth.uid());

-- Availability
CREATE POLICY "Tutors can view own availability" ON public.availability_slots
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own availability" ON public.availability_slots
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own availability" ON public.availability_slots
  FOR UPDATE USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can delete own availability" ON public.availability_slots
  FOR DELETE USING (tutor_id = auth.uid());

-- Public read for booking availability
CREATE POLICY "Public can view availability" ON public.availability_slots
  FOR SELECT USING (true);

-- Sessions
CREATE POLICY "Tutors can view own sessions" ON public.sessions
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own sessions" ON public.sessions
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own sessions" ON public.sessions
  FOR UPDATE USING (tutor_id = auth.uid());

-- Recurring sessions
CREATE POLICY "Tutors can view own recurring sessions" ON public.recurring_sessions
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own recurring sessions" ON public.recurring_sessions
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own recurring sessions" ON public.recurring_sessions
  FOR UPDATE USING (tutor_id = auth.uid());

-- Session notes
CREATE POLICY "Tutors can view own notes" ON public.session_notes
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own notes" ON public.session_notes
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own notes" ON public.session_notes
  FOR UPDATE USING (tutor_id = auth.uid());

-- Reminders
CREATE POLICY "Tutors can view own reminders" ON public.reminders
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own reminders" ON public.reminders
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own reminders" ON public.reminders
  FOR UPDATE USING (tutor_id = auth.uid());

-- Payments
CREATE POLICY "Tutors can view own payments" ON public.payments
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own payments" ON public.payments
  FOR UPDATE USING (tutor_id = auth.uid());

-- Makeup credits
CREATE POLICY "Tutors can view own makeup credits" ON public.makeup_credits
  FOR SELECT USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can insert own makeup credits" ON public.makeup_credits
  FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update own makeup credits" ON public.makeup_credits
  FOR UPDATE USING (tutor_id = auth.uid());

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON public.tutor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_student_packages_updated_at BEFORE UPDATE ON public.student_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON public.availability_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_recurring_sessions_updated_at BEFORE UPDATE ON public.recurring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON public.session_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
