export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type AISettings = {
  auto_generate_summaries: boolean;
  summary_tone: "professional" | "friendly" | "concise";
};

export type NotificationSettings = {
  email_24h_reminder: boolean;
  email_same_day_reminder: boolean;
  email_student_reminder: boolean;
  email_new_booking: boolean;
  email_cancellation: boolean;
  email_payment_received: boolean;
  email_weekly_summary: boolean;
  push_enabled: boolean;
};

export type TutorProfile = {
  id: string;
  user_id: string;
  business_name: string;
  phone: string | null;
  timezone: string;
  lesson_type: string;
  default_lesson_duration: number;
  booking_link_slug: string;
  cancellation_policy: string;
  reminder_preferences: Record<string, boolean>;
  makeup_policy: string | null;
  ai_settings: AISettings;
  notification_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: string;
  tutor_id: string;
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  lesson_type: string | null;
  default_duration: number | null;
  notes: string | null;
  status: "active" | "inactive" | "paused";
  created_at: string;
  updated_at: string;
};

export type Package = {
  id: string;
  tutor_id: string;
  name: string;
  lesson_count: number;
  price: number;
  deposit_amount: number | null;
  lesson_duration: number;
  makeup_credit_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentPackage = {
  id: string;
  student_id: string;
  package_id: string;
  tutor_id: string;
  total_lessons: number;
  used_lessons: number;
  remaining_lessons: number;
  makeup_credits_total: number;
  makeup_credits_used: number;
  payment_status: "pending" | "paid" | "paid_manually" | "failed" | "refunded";
  stripe_payment_id: string | null;
  manual_payment_method: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SessionStatus =
  | "scheduled"
  | "completed"
  | "canceled_by_parent"
  | "canceled_by_tutor"
  | "no_show"
  | "rescheduled";

export type Session = {
  id: string;
  tutor_id: string;
  student_id: string;
  student_package_id: string | null;
  start_time: string;
  end_time: string;
  timezone: string;
  status: SessionStatus;
  cancellation_reason: string | null;
  canceled_at: string | null;
  counts_against_package: boolean;
  makeup_credit_used: boolean;
  recurrence_id: string | null;
  created_at: string;
  updated_at: string;
};

export type RecurringSession = {
  id: string;
  tutor_id: string;
  student_id: string;
  student_package_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string | null;
  status: "active" | "ended" | "canceled";
  created_at: string;
  updated_at: string;
};

export type SessionNote = {
  id: string;
  session_id: string;
  student_id: string;
  tutor_id: string;
  private_note: string | null;
  ai_parent_summary: string | null;
  homework: string | null;
  progress_tags: string[] | null;
  sent_to_parent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReminderType =
  | "booking_confirmation_parent"
  | "booking_confirmation_tutor"
  | "lesson_reminder_24h"
  | "lesson_reminder_same_day"
  | "student_reminder"
  | "payment_reminder"
  | "package_renewal"
  | "session_summary";

export type Reminder = {
  id: string;
  session_id: string | null;
  tutor_id: string;
  student_id: string | null;
  recipient_type: "parent" | "student" | "tutor";
  recipient_email: string;
  reminder_type: ReminderType;
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "paid_manually";

export type Payment = {
  id: string;
  tutor_id: string;
  student_id: string;
  student_package_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_type: "package" | "deposit" | "manual";
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  manual_payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MakeupCredit = {
  id: string;
  tutor_id: string;
  student_id: string;
  student_package_id: string;
  source_session_id: string | null;
  used_session_id: string | null;
  reason: string;
  status: "available" | "used" | "expired";
  created_at: string;
  used_at: string | null;
};

export type AvailabilitySlot = {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type DashboardData = {
  todaySessions: Session[];
  upcomingSessions: Session[];
  pendingPayments: Payment[];
  lowPackages: StudentPackage[];
  recentNotes: SessionNote[];
  makeupCreditAlerts: MakeupCredit[];
  noShowAlerts: Session[];
  cancellationAlerts: Session[];
};
