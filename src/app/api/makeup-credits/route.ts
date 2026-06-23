import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("makeup_credits")
    .select("*, students(student_name), student_packages(packages(name))")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credits: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { student_id, student_package_id, source_session_id, reason } = body;

  if (!student_id || !student_package_id) {
    return NextResponse.json({ error: "student_id and student_package_id are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("makeup_credits")
    .insert({
      tutor_id: user.id,
      student_id,
      student_package_id,
      source_session_id: source_session_id || null,
      reason: reason || "Manual credit",
      status: "available",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credit: data }, { status: 201 });
}
