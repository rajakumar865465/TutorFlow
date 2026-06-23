import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("tutor_id", user.id)
    .order("day_of_week", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slots: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { day_of_week, start_time, end_time, is_recurring, specific_date, is_blocked } = body;

  if (day_of_week === undefined || !start_time || !end_time) {
    return NextResponse.json({ error: "day_of_week, start_time, and end_time are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      tutor_id: user.id,
      day_of_week,
      start_time,
      end_time,
      is_recurring: is_recurring !== false,
      specific_date: specific_date || null,
      is_blocked: is_blocked || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ slot: data }, { status: 201 });
}
