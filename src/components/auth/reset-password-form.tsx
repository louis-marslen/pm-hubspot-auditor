"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Au moins 8 caractères");
  if (password.length > 128) errors.push("Maximum 128 caractères");
  if (!/[A-Z]/.test(password)) errors.push("Au moins une lettre majuscule");
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("Au moins un chiffre ou caractère spécial");
  return errors;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string[];
    confirm?: string;
  }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setFieldErrors({ password: passwordErrors });
      return;
    }
    if (password !== confirm) {
      setFieldErrors({ confirm: "Les mots de passe ne correspondent pas." });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Sign out to invalidate all sessions, then redirect to login
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
        {fieldErrors.password && fieldErrors.password.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-sm text-red-600">
            {fieldErrors.password.map((err) => (
              <li key={err}>• {err}</li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Min. 8 caractères, 1 majuscule, 1 chiffre ou caractère spécial.
        </p>
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
        error={fieldErrors.confirm}
      />

      <Button type="submit" loading={loading} className="w-full">
        Enregistrer le nouveau mot de passe
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
          Annuler
        </Link>
      </p>
    </form>
  );
}
