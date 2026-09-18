import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.CHARGILY_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Chargily configuration is missing" },
        { status: 500 },
      );
    }

    const body = await request.text();

    const signature = request.headers.get("signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      )
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    const payload = JSON.parse(body);

    const checkout = payload.data ?? payload;

    if (checkout.status !== "paid") {
      return NextResponse.json({
        received: true,
        status: checkout.status,
      });
    }

    const checkoutId = checkout.id;

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID missing" },
        { status: 400 },
      );
    }

  const supabase = createAdminClient();

    const { error } = await supabase
      .from("enrollments")
      .update({
        payment_status: "paid",
      })
      .eq("chargily_checkout_id", checkoutId);

    if (error) {
      console.error("Enrollment update error:", error);

      return NextResponse.json(
        { error: "Unable to update enrollment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      received: true,
      paid: true,
    });
  } catch (error) {
    console.error("Chargily webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}