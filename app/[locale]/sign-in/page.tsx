"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { Lock, User, Mail, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const locale = useLocale();

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
        setMessage("Erreur de connexion : " + error.message);
        return;
      }

      setLoading(false);
      setIsSuccess(true);
      setMessage("Connexion réussie ! Redirection...");
      setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 700);
    } else {
      // Sign Up
      if (!fullName.trim()) {
        setLoading(false);
        setMessage("Veuillez saisir votre nom complet.");
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
        setMessage("Erreur d'inscription : " + error.message);
        return;
      }

      if (data.user) {
        // Upsert into profiles table
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          role: "Étudiant Evolve",
          updated_at: new Date().toISOString(),
        });
      }

      setLoading(false);
      setIsSuccess(true);
      setMessage("Compte créé avec succès ! Redirection vers votre tableau de bord...");
      setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 900);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-green-100 selection:text-green-900">
      <Navbar />

      <main className="flex-1 px-4 pt-32 pb-20 sm:px-6 relative overflow-hidden flex items-center justify-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[550px] rounded-full bg-violet-100 blur-[130px] opacity-60" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-purple-100 blur-[120px] opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />

        <div className="relative z-10 w-full max-w-md">
          {/* Card Container */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1 text-xs font-bold text-violet-700 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Evolve Academy Auth
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900">
                {mode === "signin" ? "Bon retour parmi nous" : "Rejoignez l'académie"}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                {mode === "signin"
                  ? "Accédez à vos cours, attestations et projets en temps réel."
                  : "Créez votre compte apprenant relié à votre base de données Supabase."}
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
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                  mode === "signup"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Créer un compte
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
                    Nom &amp; Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="ex: Yacine Benali"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="etudiant@evolve.dz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none transition disabled:opacity-50"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "signin" ? "Accéder à mon espace" : "Créer mon compte"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer helper */}
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <Link
                href={`/${locale}/formations`}
                className="text-xs text-gray-400 hover:text-violet-700 transition"
              >
                ← Continuer sans compte pour explorer le catalogue
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
