import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: student, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch related data for the student detail page
  const [packagesResult, sessionsResult, makeupCreditsResult] =
    await Promise.all([
      supabase
        .from("student_packages")
        .select("*, packages(name, lesson_count, price)")
        .eq("student_id", id)
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("sessions")
        .select("*, session_notes(*)")
        .eq("student_id", id)
        .eq("tutor_id", user.id)
        .order("start_time", { ascending: false })
        .limit(50),
      supabase
        .from("makeup_credits")
        .select("*")
        .eq("student_id", id)
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  return NextResponse.json({
    student,
    packages: packagesResult.data || [],
    sessions: sessionsResult.data || [],
    makeupCredits: makeupCreditsResult.data || [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const {
    student_name,
    student_email,
    student_phone,
    parent_name,
    parent_email,
    parent_phone,
    lesson_type,
    default_duration,
    notes,
    status,
  } = body;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("students")
    .select("id")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (student_name !== undefined) updateData.student_name = student_name.trim();
  if (student_email !== undefined) updateData.student_email = student_email || null;
  if (student_phone !== undefined) updateData.student_phone = student_phone || null;
  if (parent_name !== undefined) updateData.parent_name = parent_name || null;
  if (parent_email !== undefined) updateData.parent_email = parent_email || null;
  if (parent_phone !== undefined) updateData.parent_phone = parent_phone || null;
  if (lesson_type !== undefined) updateData.lesson_type = lesson_type;
  if (default_duration !== undefined) updateData.default_duration = default_duration;
  if (notes !== undefined) updateData.notes = notes || null;
  if (status !== undefined) {
    if (!["active", "inactive", "paused"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
    updateData.status = status;
  }

  const { data, error } = await supabase
    .from("students")
    .update(updateData)
    .eq("id", id)
    .eq("tutor_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ student: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("students")
    .select("id")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Soft delete by setting status to inactive
  const { error } = await supabase
    .from("students")
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("tutor_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
