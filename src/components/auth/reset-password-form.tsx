"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleCheck, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "Au moins 8 caractères" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Au moins une majuscule" },
  {
    test: (p: string) => /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
    label: "Au moins un chiffre ou caractère spécial",
  },
];

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setConfirmError(null);

    const hasErrors = passwordRules.some((r) => !r.test(password));
    if (hasErrors) return;

    if (password !== confirm) {
      setConfirmError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.auth.signOut({ scope: "global" });
    router.push("/login?reset=success");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert type="error">{error}</Alert>}

      <div>
        <Input
          id="password"
          type="password"
          label="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
        />
        {password.length > 0 && (
          <ul className="mt-2 space-y-1">
            {passwordRules.map((rule) => {
              const valid = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs ${
                    valid ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {valid ? (
                    <CircleCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Input
        id="confirm"
        type="password"
        label="Confirmer le nouveau mot de passe"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        error={confirmError ?? undefined}
      />

      <Button type="submit" loading={loading} className="w-full">
        Enregistrer
      </Button>

      <p className="text-center text-sm">
        <Link href="/login" className="text-brand-500 hover:text-brand-400 transition-colors">
          Annuler
        </Link>
      </p>
    </form>
  );
}
