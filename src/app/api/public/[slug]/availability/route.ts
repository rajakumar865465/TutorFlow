import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { addDays, format, getDay, parseISO } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start") || format(new Date(), "yyyy-MM-dd");
  const endDate = searchParams.get("end") || format(addDays(new Date(), 14), "yyyy-MM-dd");

  // Get tutor profile
  const { data: profile } = await supabase
    .from("tutor_profiles")
    .select("user_id, timezone, default_lesson_duration")
    .eq("booking_link_slug", slug)
    .single();

  if (!profile) return NextResponse.json({ error: "Tutor not found" }, { status: 404 });

  // Get recurring availability
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("tutor_id", profile.user_id)
    .eq("is_blocked", false);

  // Get existing sessions to exclude
  const { data: sessions } = await supabase
    .from("sessions")
    .select("start_time, end_time")
    .eq("tutor_id", profile.user_id)
    .in("status", ["scheduled", "rescheduled"])
    .gte("start_time", startDate)
    .lte("start_time", endDate + "T23:59:59");

  const bookedSlots = (sessions || []).map((s) => ({
    start: new Date(s.start_time).getTime(),
    end: new Date(s.end_time).getTime(),
  }));

  // Generate available time slots for each day
  const availableSlots: { date: string; start_time: string; end_time: string }[] = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  for (let d = start; d <= end; d = addDays(d, 1)) {
    const dayOfWeek = getDay(d);
    const dateStr = format(d, "yyyy-MM-dd");

    const daySlots = (slots || []).filter((s) => {
      if (s.specific_date && format(parseISO(s.specific_date), "yyyy-MM-dd") === dateStr) return true;
      if (s.is_recurring && s.day_of_week === dayOfWeek) return true;
      return false;
    });

    for (const slot of daySlots) {
      const slotStart = new Date(`${dateStr}T${slot.start_time}`);
      const slotEnd = new Date(`${dateStr}T${slot.end_time}`);
      const duration = profile.default_lesson_duration * 60000;

      for (let t = slotStart.getTime(); t + duration <= slotEnd.getTime(); t += duration) {
        const slotStartTime = new Date(t);
        const slotEndTime = new Date(t + duration);

        const isBooked = bookedSlots.some(
          (b) => slotStartTime.getTime() < b.end && slotEndTime.getTime() > b.start
        );

        if (!isBooked) {
          availableSlots.push({
            date: dateStr,
            start_time: slotStartTime.toISOString(),
            end_time: slotEndTime.toISOString(),
          });
        }
      }
    }
  }

  return NextResponse.json({ slots: availableSlots, timezone: profile.timezone });
}
