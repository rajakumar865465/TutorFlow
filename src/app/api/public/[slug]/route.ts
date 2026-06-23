import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: profile, error } = await supabase
    .from("tutor_profiles")
    .select("*, users(name, email)")
    .eq("booking_link_slug", slug)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
  }

  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("tutor_id", profile.user_id)
    .eq("is_active", true);

  return NextResponse.json({
    tutor: {
      name: profile.users?.name || profile.business_name,
      business_name: profile.business_name,
      lesson_type: profile.lesson_type,
      default_lesson_duration: profile.default_lesson_duration,
      timezone: profile.timezone,
    },
    packages: packages || [],
  });
}
