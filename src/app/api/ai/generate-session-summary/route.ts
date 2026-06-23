import { generateParentSummary } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { session_id, private_note } = body;

  if (!session_id || !private_note) {
    return NextResponse.json({ error: "session_id and private_note are required" }, { status: 400 });
  }

  const summary = await generateParentSummary(private_note);

  // Save/update session note
  const { data: existingNote } = await supabase
    .from("session_notes")
    .select("id")
    .eq("session_id", session_id)
    .eq("tutor_id", user.id)
    .single();

  if (existingNote) {
    const { data, error } = await supabase
      .from("session_notes")
      .update({ ai_parent_summary: summary })
      .eq("id", existingNote.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data });
  }

  // Get student_id from session
  const { data: session } = await supabase
    .from("sessions")
    .select("student_id")
    .eq("id", session_id)
    .eq("tutor_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("session_notes")
    .insert({
      session_id,
      student_id: session.student_id,
      tutor_id: user.id,
      private_note,
      ai_parent_summary: summary,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
