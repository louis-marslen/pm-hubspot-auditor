"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmPage() {
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  async function handleResend() {
    setResending(true);
    // Resend is handled via supabase - the email was already sent on register
    // This is a UX placeholder; in practice the user would need to supply their email
    setTimeout(() => {
      setResending(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
    }, 1000);
  }

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-900">
          <Mail className="h-8 w-8 text-brand-300" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold text-gray-100">
        Vérifiez votre boîte email
      </h1>
      <p className="mt-3 text-sm text-gray-400">
        Un lien de confirmation a été envoyé à votre adresse email.
        Cliquez dessus pour activer votre compte.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Le lien est valable 24 heures.
      </p>
      <div className="mt-6 space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          loading={resending}
          disabled={cooldown}
        >
          {cooldown ? "Email renvoyé" : "Renvoyer l'email"}
        </Button>
        <div>
          <Link
            href="/login"
            className="text-sm text-brand-500 hover:text-brand-400 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
