import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { session_id, student_id, reminder_type, recipient_type, recipient_email, scheduled_for } = body;

  if (!session_id || !reminder_type || !recipient_email || !scheduled_for) {
    return NextResponse.json({ error: "session_id, reminder_type, recipient_email, and scheduled_for are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      session_id,
      tutor_id: user.id,
      student_id: student_id || null,
      recipient_type: recipient_type || "parent",
      recipient_email,
      reminder_type,
      scheduled_for,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reminder: data }, { status: 201 });
}
