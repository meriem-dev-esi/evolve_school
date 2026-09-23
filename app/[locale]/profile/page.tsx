import Link from "next/link";
import LearningPreferencesForm from "@/components/LearningPreferencesForm";
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

  // Get currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User is not authenticated
  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-ink">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-500/10 border border-lime-500/20">
            <span className="text-2xl">👤</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your profile
          </h1>

          <p className="mt-3 text-gray-500">
            Access your account information and learning preferences.
          </p>

          <Link
            href={`/${locale}/sign-in`}
            className="mt-8 inline-flex rounded-full bg-lime-400 px-7 py-3 font-semibold text-black transition hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-400/20"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Load profile information
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    "Evolve Student";

  const email = user.email ?? "";

  return (
    <main className="min-h-dvh bg-canvas px-5 py-20 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-lime-600 dark:text-lime-400">
            Evolve
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            My Profile
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
            Manage your account, personal information, and learning preferences
            in one place.
          </p>
        </header>

        {/* Profile overview */}
        <section className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border border-gray-200 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500 text-2xl font-bold text-black shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">{email}</p>
              </div>
            </div>

            <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 shadow-sm">
              Student Account
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Account Information
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Update your name and profile picture.
            </p>
          </div>

          <ProfileForm
            userId={user.id}
            email={email}
            initialName={profile?.full_name ?? ""}
            initialAvatar={profile?.avatar_url ?? ""}
          />
        </section>

        {/* Learning preferences */}
        <section className="mt-14 border-t border-gray-200 pt-14">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400">
              Personalization
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Learning Preferences
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Tell Evolve what you want to learn so we can personalize your
              course recommendations.
            </p>
          </div>

          <LearningPreferencesForm />
        </section>
      </div>
    </main>
  );
}
