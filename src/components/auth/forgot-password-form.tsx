"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // Always call resetPasswordForEmail regardless of whether email exists
    // Response is always the same to avoid account enumeration
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Alert type="success">
        <p className="font-medium">Vérifiez votre boîte email.</p>
        <p className="mt-1">
          Si un compte existe avec cet email, vous recevrez un lien de
          réinitialisation valable 1 heure.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-block text-sm font-medium underline"
        >
          Retour à la connexion
        </Link>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-gray-600">
        Saisissez votre email et nous vous enverrons un lien pour réinitialiser
        votre mot de passe.
      </p>

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

      <Button type="submit" loading={loading} className="w-full">
        Envoyer le lien
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
