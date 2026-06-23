import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("session_notes")
    .select("*, students(student_name), sessions(start_time)")
    .eq("tutor_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, private_note, ai_parent_summary, homework } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("session_notes")
    .select("id")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (private_note !== undefined) updateData.private_note = private_note;
  if (ai_parent_summary !== undefined) updateData.ai_parent_summary = ai_parent_summary;
  if (homework !== undefined) updateData.homework = homework;

  const { data, error } = await supabase
    .from("session_notes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
