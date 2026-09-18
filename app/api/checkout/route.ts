import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
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
        { error: "courseId is required" },
        { status: 400 },
      );
    }

    if (!locale) {
      return NextResponse.json(
        { error: "locale is required" },
        { status: 400 },
      );
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, price")
      .eq("id", courseId)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 },
      );
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "Invalid course price" },
        { status: 400 },
      );
    }

    const secretKey = process.env.CHARGILY_SECRET_KEY;
    const apiUrl = process.env.CHARGILY_API_URL;

    if (!secretKey || !apiUrl) {
      return NextResponse.json(
        { error: "Chargily configuration is missing" },
        { status: 500 },
      );
    }

    const origin = new URL(request.url).origin;

    const checkoutResponse = await fetch(`${apiUrl}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: course.price,
        currency: "dzd",
        payment_method: "edahabia",
        locale:
          locale === "ar" || locale === "fr"
            ? locale
            : "en",
        description: course.title,
        success_url: `${origin}/${locale}/courses/${course.id}`,
        failure_url: `${origin}/${locale}/courses/${course.id}/checkout`,
        webhook_endpoint: `${process.env.APP_URL}/api/webhooks/chargily`,
        metadata: {
          user_id: user.id,
          course_id: course.id,
        },
      }),
    });

    const checkout = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error("CHARGILY STATUS:", checkoutResponse.status);
console.error("CHARGILY ERROR:", JSON.stringify(checkout, null, 2));

      return NextResponse.json(
        { error: "Unable to create payment" },
        { status: checkoutResponse.status },
      );
    }

    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: user.id,
          course_id: course.id,
          payment_status: "pending",
          chargily_checkout_id: checkout.id,
        },
        {
          onConflict: "user_id,course_id",
        },
      );

    if (enrollmentError) {
      console.error(
        "Enrollment error:",
        enrollmentError,
      );

    return NextResponse.json(
  {
    error: "Unable to create payment",
    details: checkout,
  },
  { status: checkoutResponse.status },
);
    }

   const checkoutUrl =
  checkout.checkout_url || checkout.url;

if (!checkoutUrl) {
  return NextResponse.json(
    { error: "Payment URL was not returned" },
    { status: 500 },
  );
}

return NextResponse.redirect(checkoutUrl, 303);
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}