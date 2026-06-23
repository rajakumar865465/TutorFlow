import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, bookingConfirmationParentHtml, bookingConfirmationTutorHtml } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const body = await request.json();
  const { package_id, start_time, student_name, student_email, parent_name, parent_email, parent_phone, recurring } = body;

  if (!package_id || !start_time || !student_name || !parent_email) {
    return NextResponse.json({ error: "package_id, start_time, student_name, and parent_email are required" }, { status: 400 });
  }

  // Get tutor profile
  const { data: profile } = await supabase
    .from("tutor_profiles")
    .select("*, users(name, email)")
    .eq("booking_link_slug", slug)
    .single();

  if (!profile) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });

  // Get package
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", package_id)
    .eq("tutor_id", profile.user_id)
    .eq("is_active", true)
    .single();

  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  // Find or create student
  let { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("tutor_id", profile.user_id)
    .eq("parent_email", parent_email)
    .eq("student_name", student_name)
    .single();

  if (!student) {
    const { data: newStudent, error: se } = await supabase
      .from("students")
      .insert({
        tutor_id: profile.user_id,
        student_name,
        student_email: student_email || null,
        parent_name: parent_name || null,
        parent_email,
        parent_phone: parent_phone || null,
        lesson_type: profile.lesson_type,
        default_duration: pkg.lesson_duration,
        status: "active",
      })
      .select()
      .single();

    if (se) return NextResponse.json({ error: se.message }, { status: 500 });
    student = newStudent;
  }

  if (!student) return NextResponse.json({ error: "Failed to create student" }, { status: 500 });

  // Create student package
  const { data: studentPackage, error: spe } = await supabase
    .from("student_packages")
    .insert({
      student_id: student.id,
      package_id: pkg.id,
      tutor_id: profile.user_id,
      total_lessons: pkg.lesson_count,
      used_lessons: 0,
      remaining_lessons: pkg.lesson_count,
      makeup_credits_total: pkg.makeup_credit_limit,
      makeup_credits_used: 0,
      payment_status: "pending",
    })
    .select()
    .single();

  if (spe) return NextResponse.json({ error: spe.message }, { status: 500 });

  // Calculate session end time
  const sessionStart = new Date(start_time);
  const sessionEnd = new Date(sessionStart.getTime() + pkg.lesson_duration * 60000);

  // Create first session
  const { data: session, error: se2 } = await supabase
    .from("sessions")
    .insert({
      tutor_id: profile.user_id,
      student_id: student.id,
      student_package_id: studentPackage.id,
      start_time: sessionStart.toISOString(),
      end_time: sessionEnd.toISOString(),
      timezone: profile.timezone,
      status: "scheduled",
    })
    .select()
    .single();

  if (se2) return NextResponse.json({ error: se2.message }, { status: 500 });

  // Create recurring sessions if requested
  if (recurring) {
    const dayOfWeek = sessionStart.getDay();
    const recData = {
      tutor_id: profile.user_id,
      student_id: student.id,
      student_package_id: studentPackage.id,
      day_of_week: dayOfWeek,
      start_time: sessionStart.toTimeString().slice(0, 8),
      end_time: sessionEnd.toTimeString().slice(0, 8),
      start_date: sessionStart.toISOString().split("T")[0],
      status: "active",
    };

    const { data: recurrence } = await supabase
      .from("recurring_sessions")
      .insert(recData)
      .select()
      .single();

    // Create future weekly sessions (up to total lesson count)
    const recurrenceId = recurrence?.id;
    const sessionsToCreate = [];
    for (let i = 1; i < pkg.lesson_count && sessionsToCreate.length < pkg.lesson_count - 1; i++) {
      const nextStart = new Date(sessionStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const nextEnd = new Date(nextStart.getTime() + pkg.lesson_duration * 60000);
      sessionsToCreate.push({
        tutor_id: profile.user_id,
        student_id: student.id,
        student_package_id: studentPackage.id,
        start_time: nextStart.toISOString(),
        end_time: nextEnd.toISOString(),
        timezone: profile.timezone,
        status: "scheduled",
        recurrence_id: recurrenceId,
      });
    }

    if (sessionsToCreate.length > 0) {
      await supabase.from("sessions").insert(sessionsToCreate);
    }
  }

  // Schedule reminders
  const reminderTime24h = new Date(sessionStart.getTime() - 24 * 60 * 60 * 1000);
  await supabase.from("reminders").insert([
    {
      session_id: session.id,
      tutor_id: profile.user_id,
      student_id: student.id,
      recipient_type: "parent",
      recipient_email: parent_email,
      reminder_type: "booking_confirmation_parent",
      scheduled_for: new Date().toISOString(),
      status: "sent",
      sent_at: new Date().toISOString(),
    },
    {
      session_id: session.id,
      tutor_id: profile.user_id,
      student_id: student.id,
      recipient_type: "tutor",
      recipient_email: profile.users?.email || "",
      reminder_type: "booking_confirmation_tutor",
      scheduled_for: new Date().toISOString(),
      status: "sent",
      sent_at: new Date().toISOString(),
    },
    {
      session_id: session.id,
      tutor_id: profile.user_id,
      student_id: student.id,
      recipient_type: "parent",
      recipient_email: parent_email,
      reminder_type: "lesson_reminder_24h",
      scheduled_for: reminderTime24h.toISOString(),
      status: "pending",
    },
  ]);

  // Send booking confirmation emails immediately
  const tutorName = profile.users?.name || profile.business_name || "Your Tutor";
  const sessionDate = sessionStart.toLocaleDateString();
  const sessionTime = sessionStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (parent_email) {
    await sendEmail({
      to: parent_email,
      subject: "Booking Confirmed - TutorFlow",
      html: bookingConfirmationParentHtml({
        tutorName,
        studentName: student_name,
        packageName: pkg.name,
        sessionDate,
        sessionTime,
        bookingId: session.id,
      } as any),
    });
  }

  if (profile.users?.email) {
    await sendEmail({
      to: profile.users.email,
      subject: "New Booking - TutorFlow",
      html: bookingConfirmationTutorHtml({
        tutorName,
        studentName: student_name,
        parentName: parent_name || "Parent",
        packageName: pkg.name,
        sessionDate,
        sessionTime,
      } as any),
    });
  }

  return NextResponse.json({
    booking: {
      session_id: session.id,
      student_package_id: studentPackage.id,
      student_id: student.id,
      session_start: sessionStart.toISOString(),
      package_name: pkg.name,
      total_lessons: pkg.lesson_count,
      price: pkg.price,
    },
    requires_payment: true,
    student_package_id: studentPackage.id,
  }, { status: 201 });
}
