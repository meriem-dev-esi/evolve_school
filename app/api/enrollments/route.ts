import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMIT_TIERS } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour vous inscrire à ce cours." },
        { status: 401 },
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(
      `enrollment:${user.id}`,
      RATE_LIMIT_TIERS.CHECKOUT_PAYMENT.limit,
      RATE_LIMIT_TIERS.CHECKOUT_PAYMENT.windowMs,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes d'inscription. Veuillez patienter." },
        { status: 429 },
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "L'identifiant du cours (courseId) est requis." },
        { status: 400 },
      );
    }

    // Check duplicate enrollment
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id, payment_status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        {
          error: "Vous êtes déjà inscrit à ce cours.",
          payment_status: existingEnrollment.payment_status,
          alreadyEnrolled: true,
        },
        { status: 409 },
      );
    }

    // Check course existence
    const { data: course } = await supabase
      .from("courses")
      .select("id, title, price")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) {
      return NextResponse.json(
        { error: "Le cours demandé n'existe pas." },
        { status: 404 },
      );
    }

    // Create enrollment (free course or pending payment)
    const isFree = !course.price || course.price === 0;

    const { data: newEnrollment, error: insertError } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: course.id,
        payment_status: isFree ? "paid" : "pending",
        payment_amount: course.price || 0,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: isFree ? "Inscription confirmée !" : "Inscription en attente de règlement.",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("[Enrollments API] Error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 },
    );
  }
}