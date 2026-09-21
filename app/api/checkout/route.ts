import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_TIERS } from "@/lib/rateLimiter";

// Spending safety cap
const MAX_TRANSACTION_AMOUNT_DZD = 50_000;
const MAX_DAILY_USER_SPENDING_DZD = 150_000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise pour effectuer un paiement." },
        { status: 401 },
      );
    }

    // Rate Limiting per user for checkout (10 requests per minute)
    const rateLimit = checkRateLimit(
      `checkout:${user.id}`,
      RATE_LIMIT_TIERS.CHECKOUT_PAYMENT.limit,
      RATE_LIMIT_TIERS.CHECKOUT_PAYMENT.windowMs,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives de paiement. Veuillez patienter avant de réessayer." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toString(),
          },
        },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let courseId: string;
    let locale: string;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      courseId = body.courseId;
      locale = body.locale;
    } else {
      const formData = await request.formData();
      courseId = String(formData.get("courseId") || "");
      locale = String(formData.get("locale") || "");
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "L'identifiant du cours (courseId) est requis." },
        { status: 400 },
      );
    }

    if (!locale) {
      locale = "fr";
    }

    // 1. Prevent Duplicate Payment / Subscription
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id, payment_status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment?.payment_status === "paid") {
      return NextResponse.json(
        {
          error: "Vous êtes déjà inscrit et avez déjà payé ce cours.",
          alreadyEnrolled: true,
        },
        { status: 409 },
      );
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Cours introuvable." },
        { status: 404 },
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "Prix du cours invalide." },
        { status: 400 },
      );
    }

    // 2. Spending Cap Validation
    if (course.price > MAX_TRANSACTION_AMOUNT_DZD) {
      return NextResponse.json(
        {
          error: `Le montant (${course.price} DZD) dépasse le plafond de sécurité autorisé par transaction (${MAX_TRANSACTION_AMOUNT_DZD} DZD).`,
        },
        { status: 400 },
      );
    }

    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    const { data: recentPayments } = await supabase
      .from("enrollments")
      .select("payment_amount")
      .eq("user_id", user.id)
      .eq("payment_status", "paid")
      .gte("enrolled_at", yesterday);

    const dailyTotal = (recentPayments ?? []).reduce(
      (sum, p) => sum + (p.payment_amount || 0),
      0,
    );

    if (dailyTotal + course.price > MAX_DAILY_USER_SPENDING_DZD) {
      return NextResponse.json(
        {
          error: `Plafond de sécurité quotidien de dépenses atteint (${MAX_DAILY_USER_SPENDING_DZD} DZD sur 24h).`,
        },
        { status: 400 },
      );
    }

    const secretKey = process.env.CHARGILY_SECRET_KEY;
    const apiUrl = process.env.CHARGILY_API_URL;

    if (!secretKey || !apiUrl) {
      // In dev/demo without Chargily keys, register demo enrollment gracefully
      const { data: mockEnrollment, error: mockError } = await supabase
        .from("enrollments")
        .upsert(
          {
            user_id: user.id,
            course_id: course.id,
            payment_status: "paid",
            payment_amount: course.price,
            payment_method: "demo_edahabia",
            enrolled_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_id" },
        )
        .select("id")
        .single();

      if (mockError) {
        console.error("[Checkout] Enrollment fallback error:", mockError);
      }

      const origin = new URL(request.url).origin;
      return NextResponse.json({
        checkout_url: `${origin}/${locale}/courses/${course.id}?enrolled=success`,
        demo_mode: true,
        enrollment_id: mockEnrollment?.id,
      });
    }

    // Handle timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const origin = new URL(request.url).origin;

    const checkoutResponse = await fetch(`${apiUrl}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        amount: course.price,
        currency: "dzd",
        payment_method: "edahabia",
        locale: locale === "ar" || locale === "fr" ? locale : "en",
        description: course.title,
        success_url: `${origin}/${locale}/courses/${course.id}?payment=success`,
        failure_url: `${origin}/${locale}/courses/${course.id}/checkout?payment=failed`,
        webhook_endpoint: `${process.env.APP_URL || origin}/api/webhooks/chargily`,
        metadata: {
          user_id: user.id,
          course_id: course.id,
        },
      }),
    });

    clearTimeout(timeoutId);

    const checkout = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error("CHARGILY ERROR:", checkout);
      return NextResponse.json(
        { error: "Impossible d'initialiser le paiement avec le prestataire." },
        { status: checkoutResponse.status },
      );
    }

    // Pre-create enrollment with pending status
    await supabase.from("enrollments").upsert(
      {
        user_id: user.id,
        course_id: course.id,
        payment_status: "pending",
        payment_amount: course.price,
        payment_method: "edahabia",
        checkout_id: checkout.id,
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id" },
    );

    return NextResponse.json({
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.id,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Délai d'attente dépassé vers le système de paiement (Timeout 10s)." },
        { status: 504 },
      );
    }

    console.error("[Checkout] Fatal API error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors du traitement." },
      { status: 500 },
    );
  }
}