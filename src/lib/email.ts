import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM = process.env.EMAIL_FROM || "TutorFlow <noreply@tutorflow.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!resend) {
    console.warn("Email not sent: RESEND_API_KEY not configured");
    return { success: false, error: "RESEND_API_KEY not configured", id: undefined };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send exception:", err);
    return { success: false, error: String(err) };
  }
}

export function bookingConfirmationParentHtml(params: {
  tutorName: string;
  studentName: string;
  parentName?: string;
  packageName: string;
  sessionDate: string;
  sessionTime: string;
  bookingId: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4338ca; font-size: 24px;">Booking Confirmed!</h1>
      <p>Hi ${params.parentName || "there"},</p>
      <p>Your booking for <strong>${params.studentName}</strong> has been confirmed.</p>
      <div style="background: #f8f7ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Tutor:</strong> ${params.tutorName}</p>
        <p><strong>Package:</strong> ${params.packageName}</p>
        <p><strong>Date:</strong> ${params.sessionDate}</p>
        <p><strong>Time:</strong> ${params.sessionTime}</p>
      </div>
      <p>We'll send you a reminder before the lesson.</p>
      <p>Thanks,<br>TutorFlow</p>
    </div>
  `;
}

export function bookingConfirmationTutorHtml(params: {
  tutorName: string;
  studentName: string;
  parentName: string;
  packageName: string;
  sessionDate: string;
  sessionTime: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4338ca; font-size: 24px;">New Booking!</h1>
      <p>Hi ${params.tutorName},</p>
      <p>You have a new booking.</p>
      <div style="background: #f8f7ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Student:</strong> ${params.studentName}</p>
        <p><strong>Parent:</strong> ${params.parentName}</p>
        <p><strong>Package:</strong> ${params.packageName}</p>
        <p><strong>Date:</strong> ${params.sessionDate}</p>
        <p><strong>Time:</strong> ${params.sessionTime}</p>
      </div>
      <a href="${APP_URL}/dashboard" style="background: #4338ca; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">View Dashboard</a>
      <p>Thanks,<br>TutorFlow</p>
    </div>
  `;
}

export function lessonReminderHtml(params: {
  recipientName: string;
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4338ca; font-size: 24px;">Lesson Reminder</h1>
      <p>Hi ${params.recipientName},</p>
      <p>This is a reminder about the upcoming lesson for <strong>${params.studentName}</strong>.</p>
      <div style="background: #f8f7ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Tutor:</strong> ${params.tutorName}</p>
        <p><strong>Date:</strong> ${params.sessionDate}</p>
        <p><strong>Time:</strong> ${params.sessionTime}</p>
      </div>
      <p>See you there!</p>
      <p>Thanks,<br>TutorFlow</p>
    </div>
  `;
}

export function packageRenewalHtml(params: {
  parentName: string;
  studentName: string;
  tutorName: string;
  packageName: string;
  remainingLessons: number;
  bookingLink: string;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4338ca; font-size: 24px;">Package Running Low</h1>
      <p>Hi ${params.parentName},</p>
      <p><strong>${params.studentName}</strong> only has <strong>${params.remainingLessons} lessons</strong> remaining in their "${params.packageName}" package with ${params.tutorName}.</p>
      <p>Renew now to keep lessons going without interruption:</p>
      <a href="${params.bookingLink}" style="background: #4338ca; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">Renew Package</a>
      <p>Thanks,<br>TutorFlow</p>
    </div>
  `;
}

export function sessionSummaryHtml(params: {
  parentName: string;
  studentName: string;
  tutorName: string;
  sessionDate: string;
  summary: string;
  homework: string | null;
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4338ca; font-size: 24px;">Session Update</h1>
      <p>Hi ${params.parentName},</p>
      <p>Here's an update on <strong>${params.studentName}</strong>'s lesson with ${params.tutorName} on ${params.sessionDate}.</p>
      <div style="background: #f8f7ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p>${params.summary}</p>
      </div>
      ${params.homework ? `<div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin: 16px 0;"><p><strong>Homework:</strong></p><p>${params.homework}</p></div>` : ""}
      <p>Thanks,<br>${params.tutorName} via TutorFlow</p>
    </div>
  `;
}
