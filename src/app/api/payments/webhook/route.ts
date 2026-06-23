import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = verifyWebhookSignature(body, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const studentPackageId = metadata.student_package_id;
      const paymentType = metadata.payment_type;

      // Update payment status
      const { data: payment } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_checkout_session_id", session.id)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "paid",
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
          })
          .eq("id", payment.id);
      }

      // Update student package payment status
      if (studentPackageId) {
        await supabase
          .from("student_packages")
          .update({
            payment_status: "paid",
            stripe_payment_id: session.payment_intent as string,
            started_at: new Date().toISOString(),
          })
          .eq("id", studentPackageId);
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_checkout_session_id", session.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", paymentIntent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
