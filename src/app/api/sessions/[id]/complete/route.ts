import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  if (session.status !== "scheduled" && session.status !== "rescheduled") {
    return NextResponse.json({ error: "Can only complete scheduled sessions" }, { status: 400 });
  }

  // Update session status
  const { data, error } = await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Decrement remaining lessons in student package
  if (session.student_package_id) {
    const { data: sp } = await supabase
      .from("student_packages")
      .select("remaining_lessons, used_lessons, student_id")
      .eq("id", session.student_package_id)
      .single();

    if (sp && sp.remaining_lessons > 0) {
      const newRemaining = sp.remaining_lessons - 1;
      const newUsed = sp.used_lessons + 1;

      await supabase
        .from("student_packages")
        .update({ remaining_lessons: newRemaining, used_lessons: newUsed })
        .eq("id", session.student_package_id);

      // Package renewal alert - schedule reminder when 2 lessons remain
      if (newRemaining === 2) {
        const { data: student } = await supabase
          .from("students")
          .select("parent_email, parent_name")
          .eq("id", sp.student_id)
          .single();

        if (student?.parent_email) {
          await supabase.from("reminders").insert({
            tutor_id: user.id,
            student_id: sp.student_id,
            recipient_type: "parent",
            recipient_email: student.parent_email,
            reminder_type: "package_renewal",
            scheduled_for: new Date().toISOString(),
            status: "pending",
          });
        }
      }
    }
  }

  return NextResponse.json({ session: data });
}
