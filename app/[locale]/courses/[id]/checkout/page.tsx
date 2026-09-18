import CheckoutButton from "@/components/CheckoutButton";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !course) {
    notFound();
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, payment_status")
    .eq("user_id", user.id)
    .eq("course_id", id)
    .maybeSingle();

  if (enrollment?.payment_status === "paid") {
    redirect(`/${locale}/courses/${id}`);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/${locale}/courses/${id}`}
          className="mb-8 inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to course
        </Link>

        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">
            Complete your enrollment
          </h1>

          <p className="mt-3 text-muted-foreground">
            {course.title}
          </p>

          <div className="mt-8 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">
              Course access
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Payment is required to access all lessons in this course.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">
              💳 Edahabia payment
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              The Edahabia payment system will be connected here.
            </p>

      <CheckoutButton
  courseId={id}
  locale={locale}
/>
          </div>
        </div>
      </div>
    </main>
  );
}