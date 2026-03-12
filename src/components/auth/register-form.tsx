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

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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

    // Client-side validation
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
        setError("already_exists");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/confirm");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error === "already_exists" && (
        <Alert type="error">
          Un compte existe déjà avec cet email.{" "}
          <Link href="/login" className="font-medium underline">
            Se connecter
          </Link>
        </Alert>
      )}
      {error && error !== "already_exists" && (
        <Alert type="error">{error}</Alert>
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

      <div>
        <Input
          id="password"
          type="password"
          label="Mot de passe"
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
        label="Confirmer le mot de passe"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        error={fieldErrors.confirm}
      />

      <Button type="submit" loading={loading} className="w-full">
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-gray-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
