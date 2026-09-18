"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
const locale = useLocale();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleSignIn() {
setLoading(true);
setMessage("");


const supabase = createClient();

const { error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) {
  setLoading(false);
  setMessage("Erreur : " + error.message);
  return;
}

setLoading(false);
setMessage("Connexion réussie !");

window.location.href = "/" + locale;


}

return ( <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-white"> <div className="w-full max-w-md"> <h1 className="text-4xl font-bold">Sign In</h1>


    <p className="mt-3 text-white/50">
      Welcome back to Evolve.
    </p>

    <div className="mt-8 space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-brand disabled:opacity-50"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-brand disabled:opacity-50"
      />

      <button
        type="button"
        onClick={() => {
          void handleSignIn();
        }}
        disabled={loading}
        className="w-full rounded-pill bg-brand px-6 py-4 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </div>

    {message && (
      <p
        className={`mt-4 text-sm ${
          message.startsWith("Erreur")
            ? "text-red-400"
            : "text-brand"
        }`}
      >
        {message}
      </p>
    )}
  </div>
</main>
);
}
