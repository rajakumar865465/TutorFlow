import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    })
  : null;

export function createCheckoutSession(params: {
  packageId: string;
  packageName: string;
  price: number;
  tutorId: string;
  studentId: string;
  studentPackageId: string;
  depositAmount?: number;
  bookingSlug: string;
}) {
  if (!stripe) {
    throw new Error("Stripe not configured: STRIPE_SECRET_KEY is missing");
  }
  const amount = params.depositAmount || params.price;

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.packageName,
            description: params.depositAmount
              ? `Deposit for ${params.packageName}`
              : `Full payment for ${params.packageName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${params.bookingSlug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${params.bookingSlug}`,
    metadata: {
      package_id: params.packageId,
      tutor_id: params.tutorId,
      student_id: params.studentId,
      student_package_id: params.studentPackageId,
      payment_type: params.depositAmount ? "deposit" : "package",
    },
  });
}

export function verifyWebhookSignature(body: string, signature: string) {
  if (!stripe) {
    throw new Error("Stripe not configured: STRIPE_SECRET_KEY is missing");
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is missing");
  }
  return stripe.webhooks.constructEvent(body, signature, secret);
}
