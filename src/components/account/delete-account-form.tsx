"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

interface DeleteAccountFormProps {
  userEmail: string;
  userId: string;
}

export function DeleteAccountForm({ userEmail, userId }: DeleteAccountFormProps) {
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (confirmEmail !== userEmail) {
      setError("L'email saisi ne correspond pas à votre compte.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Une erreur est survenue. Réessayez.");
      return;
    }

    router.push("/?deleted=true");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert type="warning">
        <strong>Attention :</strong> Cette action supprimera définitivement
        votre compte, tous vos workspaces connectés et tous vos rapports
        d&apos;audit.
      </Alert>

      <p className="text-sm text-gray-700">
        Pour confirmer, saisissez votre email :{" "}
        <strong>{userEmail}</strong>
      </p>

      <Input
        id="confirm-email"
        type="email"
        label="Confirmer votre email"
        value={confirmEmail}
        onChange={(e) => setConfirmEmail(e.target.value)}
        required
        placeholder={userEmail}
      />

      {error && <Alert type="error">{error}</Alert>}

      <Button
        type="submit"
        variant="danger"
        loading={loading}
        disabled={confirmEmail !== userEmail}
        className="w-full"
      >
        Supprimer définitivement mon compte
      </Button>
    </form>
  );
}
