import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { package_id, student_id, student_package_id, booking_slug } = body;

  if (!package_id || !student_id) {
    return NextResponse.json({ error: "package_id and student_id are required" }, { status: 400 });
  }

  // Get package details
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", package_id)
    .eq("tutor_id", user.id)
    .single();

  if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });

  // Use existing student_package or create a new one
  let studentPackage;

  if (student_package_id) {
    const { data: existing, error: fetchErr } = await supabase
      .from("student_packages")
      .select("*")
      .eq("id", student_package_id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Student package not found" }, { status: 404 });
    }
    studentPackage = existing;
  } else {
    const { data: newPkg, error: spError } = await supabase
      .from("student_packages")
      .insert({
        student_id,
        package_id,
        tutor_id: user.id,
        total_lessons: pkg.lesson_count,
        used_lessons: 0,
        remaining_lessons: pkg.lesson_count,
        makeup_credits_total: pkg.makeup_credit_limit,
        makeup_credits_used: 0,
        payment_status: "pending",
      })
      .select()
      .single();

    if (spError) return NextResponse.json({ error: spError.message }, { status: 500 });
    studentPackage = newPkg;
  }

  try {
    const session = await createCheckoutSession({
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      tutorId: user.id,
      studentId: student_id,
      studentPackageId: studentPackage.id,
      depositAmount: pkg.deposit_amount || undefined,
      bookingSlug: booking_slug || "book",
    });

    // Store checkout session ID
    await supabase
      .from("payments")
      .insert({
        tutor_id: user.id,
        student_id,
        student_package_id: studentPackage.id,
        amount: pkg.deposit_amount || pkg.price,
        currency: "usd",
        status: "pending",
        payment_type: pkg.deposit_amount ? "deposit" : "package",
        stripe_checkout_session_id: session.id,
      });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
