import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, lessonReminderHtml, packageRenewalHtml, sessionSummaryHtml, bookingConfirmationParentHtml, bookingConfirmationTutorHtml } from "@/lib/email";

export async function POST() {
  const supabase = createServiceClient();

  // Get all pending reminders that are due
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, sessions(start_time, end_time, students(student_name, parent_name, parent_email, student_email)), students(student_name, parent_name, parent_email, student_email), tutor_profiles(business_name, users(name, email))")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(100);

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    try {
      const student = reminder.students || reminder.sessions?.students;
      const tutor = reminder.tutor_profiles;

      let html = "";
      let subject = "";

      switch (reminder.reminder_type) {
        case "booking_confirmation_parent": {
          const session = reminder.sessions;
          const sessionDate = session?.start_time ? new Date(session.start_time).toLocaleDateString() : "TBD";
          const sessionTime = session?.start_time ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
          subject = "Booking Confirmed - TutorFlow";
          html = bookingConfirmationParentHtml({
            tutorName: tutor?.users?.name || tutor?.business_name || "Your Tutor",
            studentName: student?.student_name || "Student",
            packageName: "Lesson Package",
            sessionDate,
            sessionTime,
            bookingId: reminder.session_id,
          } as any);
          break;
        }
        case "booking_confirmation_tutor": {
          const session = reminder.sessions;
          const sessionDate = session?.start_time ? new Date(session.start_time).toLocaleDateString() : "TBD";
          const sessionTime = session?.start_time ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
          subject = "New Booking - TutorFlow";
          html = bookingConfirmationTutorHtml({
            tutorName: tutor?.users?.name || "Tutor",
            studentName: student?.student_name || "Student",
            parentName: student?.parent_name || "Parent",
            packageName: "Lesson Package",
            sessionDate,
            sessionTime,
          } as any);
          break;
        }
        case "lesson_reminder_24h":
        case "lesson_reminder_same_day": {
          const session = reminder.sessions;
          const sessionDate = session?.start_time ? new Date(session.start_time).toLocaleDateString() : "TBD";
          const sessionTime = session?.start_time ? new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
          subject = reminder.reminder_type === "lesson_reminder_24h" ? "Lesson Reminder - Tomorrow" : "Lesson Reminder - Today";
          html = lessonReminderHtml({
            recipientName: reminder.recipient_type === "parent" ? (student?.parent_name || "Parent") : (student?.student_name || "Student"),
            studentName: student?.student_name || "Student",
            tutorName: tutor?.users?.name || tutor?.business_name || "Your Tutor",
            sessionDate,
            sessionTime,
          } as any);
          break;
        }
        case "package_renewal": {
          subject = "Package Renewal - TutorFlow";
          html = packageRenewalHtml({
            parentName: student?.parent_name || "Parent",
            studentName: student?.student_name || "Student",
            tutorName: tutor?.users?.name || tutor?.business_name || "Your Tutor",
            packageName: "Lesson Package",
            remainingLessons: 2,
            bookingLink: `${process.env.NEXT_PUBLIC_APP_URL}/book/${tutor?.booking_link_slug}`,
          } as any);
          break;
        }
        case "session_summary": {
          // Handled separately in session notes flow
          subject = "Session Update - TutorFlow";
          html = "<p>Session summary</p>";
          break;
        }
        default: {
          subject = "TutorFlow Notification";
          html = "<p>You have a notification from TutorFlow.</p>";
        }
      }

      const result = await sendEmail({
        to: reminder.recipient_email,
        subject,
        html,
      });

      if (result.success) {
        await supabase
          .from("reminders")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", reminder.id);
        sent++;
      } else {
        await supabase
          .from("reminders")
          .update({ status: "failed", error_message: result.error })
          .eq("id", reminder.id);
        failed++;
      }
    } catch (err) {
      await supabase
        .from("reminders")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", reminder.id);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}
