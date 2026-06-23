import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ students: students || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  } = body;

  if (!student_name || !student_name.trim()) {
    return NextResponse.json(
      { error: "student_name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      tutor_id: user.id,
      student_name: student_name.trim(),
      student_email: student_email || null,
      student_phone: student_phone || null,
      parent_name: parent_name || null,
      parent_email: parent_email || null,
      parent_phone: parent_phone || null,
      lesson_type: lesson_type || "both",
      default_duration: default_duration || 60,
      notes: notes || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ student: data }, { status: 201 });
}
