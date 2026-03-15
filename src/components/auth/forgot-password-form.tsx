"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <Mail className="h-6 w-6 text-green-400" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-100 mb-2">Vérifiez votre boîte email.</p>
        <p className="text-sm text-gray-400 mb-4">
          Si un compte existe avec cet email, vous recevrez un lien de
          réinitialisation valable 1 heure.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-brand-500 hover:text-brand-400 transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <p className="text-center text-sm">
        <Link href="/login" className="text-brand-500 hover:text-brand-400 transition-colors">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
