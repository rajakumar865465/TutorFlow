import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { student_id, student_package_id, amount, manual_payment_method } = body;

  if (!student_id || !amount || !manual_payment_method) {
    return NextResponse.json({ error: "student_id, amount, and manual_payment_method are required" }, { status: 400 });
  }

  const validMethods = ["venmo", "zelle", "cash", "bank_transfer", "other"];
  if (!validMethods.includes(manual_payment_method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      tutor_id: user.id,
      student_id,
      student_package_id: student_package_id || null,
      amount,
      currency: "usd",
      status: "paid_manually",
      payment_type: "manual",
      manual_payment_method,
      paid_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update student package if linked
  if (student_package_id) {
    await supabase
      .from("student_packages")
      .update({ payment_status: "paid_manually", manual_payment_method, started_at: new Date().toISOString() })
      .eq("id", student_package_id);
  }

  return NextResponse.json({ payment: data }, { status: 201 });
}
