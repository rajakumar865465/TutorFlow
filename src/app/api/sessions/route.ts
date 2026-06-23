import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const student_id = searchParams.get("student_id");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = supabase
    .from("sessions")
    .select("*, students(student_name, parent_name, parent_email), student_packages(packages(name)), session_notes(id, private_note, ai_parent_summary)")
    .eq("tutor_id", user.id)
    .order("start_time", { ascending: true });

  if (status) query = query.eq("status", status);
  if (student_id) query = query.eq("student_id", student_id);
  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("start_time", end);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { student_id, student_package_id, start_time, end_time, timezone, recurrence_id } = body;

  if (!student_id || !start_time || !end_time) {
    return NextResponse.json({ error: "student_id, start_time, and end_time are required" }, { status: 400 });
  }

  // Check for double booking
  const { data: conflicts } = await supabase
    .from("sessions")
    .select("id")
    .eq("tutor_id", user.id)
    .in("status", ["scheduled", "rescheduled"])
    .lt("start_time", end_time)
    .gt("end_time", start_time);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: "Time slot conflicts with existing session" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      tutor_id: user.id,
      student_id,
      student_package_id: student_package_id || null,
      start_time,
      end_time,
      timezone: timezone || "America/New_York",
      status: "scheduled",
      recurrence_id: recurrence_id || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data }, { status: 201 });
}
