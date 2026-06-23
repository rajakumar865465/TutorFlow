import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekEnd = endOfDay(addDays(now, 7)).toISOString();

  // Today's sessions
  const { data: todaySessions } = await supabase
    .from("sessions")
    .select("*, students(student_name)")
    .eq("tutor_id", user.id)
    .gte("start_time", todayStart)
    .lte("start_time", todayEnd)
    .order("start_time");

  // Upcoming sessions (next 7 days)
  const { data: upcomingSessions } = await supabase
    .from("sessions")
    .select("*, students(student_name)")
    .eq("tutor_id", user.id)
    .eq("status", "scheduled")
    .gte("start_time", now.toISOString())
    .lte("start_time", weekEnd)
    .order("start_time")
    .limit(10);

  // Pending payments
  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("*, students(student_name)")
    .eq("tutor_id", user.id)
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: false })
    .limit(5);

  // Packages with 2 or fewer lessons remaining
  const { data: lowPackages } = await supabase
    .from("student_packages")
    .select("*, students(student_name), packages(name)")
    .eq("tutor_id", user.id)
    .lte("remaining_lessons", 2)
    .gt("remaining_lessons", 0);

  // Recent notes
  const { data: recentNotes } = await supabase
    .from("session_notes")
    .select("*, sessions(start_time), students(student_name)")
    .eq("tutor_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  // Makeup credit alerts
  const { data: makeupCredits } = await supabase
    .from("makeup_credits")
    .select("*, students(student_name)")
    .eq("tutor_id", user.id)
    .eq("status", "available");

  // No-show and cancellation alerts (last 7 days)
  const { data: alerts } = await supabase
    .from("sessions")
    .select("*, students(student_name)")
    .eq("tutor_id", user.id)
    .in("status", ["no_show", "canceled_by_parent", "canceled_by_tutor"])
    .gte("updated_at", addDays(now, -7).toISOString())
    .order("updated_at", { ascending: false })
    .limit(5);

  // Stats
  const { count: totalStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("tutor_id", user.id)
    .eq("status", "active");

  const { count: totalSessionsThisWeek } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("tutor_id", user.id)
    .gte("start_time", todayStart)
    .lte("start_time", weekEnd);

  return NextResponse.json({
    todaySessions: todaySessions || [],
    upcomingSessions: upcomingSessions || [],
    pendingPayments: pendingPayments || [],
    lowPackages: lowPackages || [],
    recentNotes: recentNotes || [],
    makeupCredits: makeupCredits || [],
    alerts: alerts || [],
    stats: {
      totalStudents: totalStudents || 0,
      totalSessionsThisWeek: totalSessionsThisWeek || 0,
    },
  });
}
