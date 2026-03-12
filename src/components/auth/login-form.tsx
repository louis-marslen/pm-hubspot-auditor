"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailNotConfirmed(false);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setEmailNotConfirmed(true);
      } else {
        // Message générique — ne révèle pas si c'est l'email ou le mot de passe
        setError("Email ou mot de passe incorrect.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResendConfirmation() {
    setResendLoading(true);
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResendLoading(false);
    setResendSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      {emailNotConfirmed && (
        <Alert type="warning">
          <p>Votre email n&apos;a pas encore été confirmé.</p>
          {resendSuccess ? (
            <p className="mt-1 text-sm">Email renvoyé ! Vérifiez votre boîte.</p>
          ) : (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendLoading}
              className="mt-1 text-sm font-medium underline disabled:opacity-50"
            >
              {resendLoading ? "Envoi…" : "Renvoyer l'email de confirmation"}
            </button>
          )}
        </Alert>
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        placeholder="vous@exemple.com"
      />

      <Input
        id="password"
        type="password"
        label="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          Se souvenir de moi (30 jours)
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-orange-600 hover:text-orange-500"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Se connecter
      </Button>

      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-orange-600 hover:text-orange-500">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
