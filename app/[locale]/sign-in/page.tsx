"use client";

import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setLoading(false);
        setMessage(tAuth("errorSignInPrefix") + error.message);
        return;
      }

      setLoading(false);
      setIsSuccess(true);
      setMessage(tAuth("successSignIn"));
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } else {
      // Sign Up
      if (!fullName.trim()) {
        setLoading(false);
        setMessage(tAuth("errorEmptyName"));
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setLoading(false);
        setMessage(tAuth("errorSignUpPrefix") + error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          role: "Étudiant Evolve",
          updated_at: new Date().toISOString(),
        });
      }

      setLoading(false);
      setIsSuccess(true);
      setMessage(tAuth("successSignUp"));
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-green-100 selection:text-green-900">
      <Navbar />

      <main className="flex-1 px-4 pt-32 pb-20 sm:px-6 relative overflow-hidden flex items-center justify-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-40 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 h-[550px] w-[550px] rounded-full bg-lime-200 blur-[130px] opacity-35" />
        <div className="pointer-events-none absolute bottom-10 end-10 h-[400px] w-[400px] rounded-full bg-emerald-200 blur-[120px] opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />

        <div className="relative z-10 w-full max-w-md">
          {/* Card Container */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3.5 py-1 text-xs font-bold text-lime-800 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-lime-600" />
                {tAuth("badge")}
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900">
                {mode === "signin"
                  ? tAuth("welcomeBack")
                  : tAuth("joinAcademy")}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                {mode === "signin"
                  ? tAuth("signInSubtitle")
                  : tAuth("signUpSubtitle")}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="mt-6 flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setMessage("");
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "signin"
                    ? "bg-lime-400 text-black shadow-md shadow-lime-400/30"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tAuth("tabSignIn")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "signup"
                    ? "bg-lime-400 text-black shadow-md shadow-lime-400/30"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tAuth("tabSignUp")}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
                  >
                    {tAuth("fullNameLabel")}
                  </label>
                  <div className="relative">
                    <User className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder={tAuth("fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 ps-11 pe-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-100 focus:outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  {tAuth("emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder={tAuth("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 ps-11 pe-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-100 focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  {tAuth("passwordLabel")}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder={tAuth("passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 ps-11 pe-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-100 focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs ${
                    isSuccess
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {isSuccess ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-400 py-3.5 text-xs sm:text-sm font-bold text-black shadow-lg shadow-lime-400/30 transition hover:bg-lime-300 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{tCommon("loading")}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? tAuth("submitSignIn")
                        : tAuth("submitSignUp")}
                    </span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>

            {/* Footer helper */}
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <Link
                href="/formations"
                className="text-xs text-gray-400 hover:text-lime-600 transition"
              >
                {tCommon("viewAll")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
