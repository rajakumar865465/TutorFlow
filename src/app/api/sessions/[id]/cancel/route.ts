import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { canceled_by, reason, counts_against_package, create_makeup_credit } = body;

  // Get session
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const status = canceled_by === "parent" ? "canceled_by_parent" : "canceled_by_tutor";

  // Update session
  const { data, error } = await supabase
    .from("sessions")
    .update({
      status,
      cancellation_reason: reason || null,
      canceled_at: new Date().toISOString(),
      counts_against_package: counts_against_package ?? false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If not counting against package, create makeup credit
  if (create_makeup_credit && session.student_package_id) {
    await supabase.from("makeup_credits").insert({
      tutor_id: user.id,
      student_id: session.student_id,
      student_package_id: session.student_package_id,
      source_session_id: id,
      reason: reason || `Canceled session on ${new Date().toLocaleDateString()}`,
      status: "available",
    });
  }

  return NextResponse.json({ session: data });
}
