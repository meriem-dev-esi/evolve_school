import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Please sign in</h1>

          <Link
            href={`/${locale}/sign-in`}
            className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-black"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-dvh bg-canvas px-6 py-24 text-white lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Evolve
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          My Profile
        </h1>

        <p className="mt-3 text-white/50">
          Manage your account information.
        </p>

        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialName={profile?.full_name ?? ""}
          initialAvatar={profile?.avatar_url ?? ""}
        />
      </div>
    </main>
  );
}