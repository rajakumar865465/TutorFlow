import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("tutor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    return NextResponse.json({ profile: null });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    business_name, phone, timezone, lesson_type, default_lesson_duration,
    cancellation_policy, reminder_preferences,
    makeup_policy, ai_settings, notification_settings,
  } = body;

  // Check if profile exists
  const { data: existing } = await supabase
    .from("tutor_profiles")
    .select("id, booking_link_slug")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("tutor_profiles")
      .update({
        business_name,
        phone: phone || null,
        timezone,
        lesson_type,
        default_lesson_duration,
        cancellation_policy,
        reminder_preferences,
        makeup_policy: makeup_policy || null,
        ai_settings,
        notification_settings,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
  }

  // Create new profile with unique booking slug
  const slug = business_name
    ? business_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 32) + "-" + Math.random().toString(36).slice(2, 8)
    : user.id.slice(0, 8);

  const { data, error } = await supabase
    .from("tutor_profiles")
    .insert({
      user_id: user.id,
      business_name: business_name || "",
      phone: phone || null,
      timezone: timezone || "America/New_York",
      lesson_type: lesson_type || "both",
      default_lesson_duration: default_lesson_duration || 60,
      booking_link_slug: slug,
      cancellation_policy: cancellation_policy || "24h",
      reminder_preferences: reminder_preferences || { "24h_reminder": true, "same_day_reminder": false, "student_reminder": false },
      makeup_policy: makeup_policy || null,
      ai_settings: ai_settings || { auto_generate_summaries: true, summary_tone: "professional" },
      notification_settings: notification_settings || {
        email_24h_reminder: true,
        email_same_day_reminder: false,
        email_student_reminder: false,
        email_new_booking: true,
        email_cancellation: true,
        email_payment_received: true,
        email_weekly_summary: false,
        push_enabled: false,
      },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
