import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail, sessionSummaryHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { note_id } = body;

  if (!note_id) {
    return NextResponse.json({ error: "note_id is required" }, { status: 400 });
  }

  // Get the note with related data
  const { data: note, error: noteError } = await supabase
    .from("session_notes")
    .select("*, students(student_name, parent_name, parent_email), sessions(start_time), tutor_profiles(business_name, users(name, email))")
    .eq("id", note_id)
    .eq("tutor_id", user.id)
    .single();

  if (noteError || !note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (!note.ai_parent_summary) {
    return NextResponse.json({ error: "No parent summary to send" }, { status: 400 });
  }

  const parentEmail = note.students?.parent_email;
  if (!parentEmail) {
    return NextResponse.json({ error: "No parent email on file for this student" }, { status: 400 });
  }

  const tutorName = note.tutor_profiles?.users?.name || note.tutor_profiles?.business_name || "Your Tutor";
  const sessionDate = note.sessions?.start_time
    ? new Date(note.sessions.start_time).toLocaleDateString()
    : "recent session";

  const html = sessionSummaryHtml({
    parentName: note.students?.parent_name || "Parent",
    studentName: note.students?.student_name || "Student",
    tutorName,
    sessionDate,
    summary: note.ai_parent_summary,
    homework: note.homework || null,
  });

  const result = await sendEmail({
    to: parentEmail,
    subject: `Session Update - ${note.students?.student_name || "Student"} - TutorFlow`,
    html,
  });

  if (result.success) {
    // Mark as sent
    await supabase
      .from("session_notes")
      .update({ sent_to_parent: true, sent_at: new Date().toISOString() })
      .eq("id", note_id);
  }

  return NextResponse.json({
    success: result.success,
    error: result.error || undefined,
  });
}
