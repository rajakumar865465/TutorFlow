import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.status === "used") {
    const { data, error } = await supabase
      .from("makeup_credits")
      .update({ status: "used", used_session_id: body.used_session_id || null, used_at: new Date().toISOString() })
      .eq("id", id)
      .eq("tutor_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ credit: data });
  }

  const { data, error } = await supabase
    .from("makeup_credits")
    .update(body)
    .eq("id", id)
    .eq("tutor_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credit: data });
}
