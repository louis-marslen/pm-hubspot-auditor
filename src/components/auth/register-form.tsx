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

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
      ) {
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
        label="Confirmer le mot de passe"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        placeholder="••••••••"
        error={confirmError ?? undefined}
      />

      <Button type="submit" loading={loading} className="w-full">
        Créer mon compte
      </Button>

      <p className="text-center text-sm text-gray-400">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-brand-500 hover:text-brand-400 transition-colors">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
