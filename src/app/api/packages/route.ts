import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ packages: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, lesson_count, price, deposit_amount, lesson_duration, makeup_credit_limit } = body;

  if (!name || !lesson_count || price === undefined) {
    return NextResponse.json({ error: "name, lesson_count, and price are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("packages")
    .insert({
      tutor_id: user.id,
      name,
      lesson_count,
      price,
      deposit_amount: deposit_amount || null,
      lesson_duration: lesson_duration || 60,
      makeup_credit_limit: makeup_credit_limit || 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ package: data }, { status: 201 });
}
