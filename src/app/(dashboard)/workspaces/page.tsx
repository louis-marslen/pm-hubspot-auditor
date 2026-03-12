"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

interface HubspotConnection {
  id: string;
  portal_id: string;
  portal_name: string | null;
  hub_domain: string | null;
  connected_at: string;
  token_expires_at: string | null;
}

function WorkspacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const connected = searchParams.get("connected");
  const error = searchParams.get("error");

  const [workspaces, setWorkspaces] = useState<HubspotConnection[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [auditing, setAuditing] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? "");

      const { data } = await supabase
        .from("hubspot_connections")
        .select("id, portal_id, portal_name, hub_domain, connected_at, token_expires_at")
        .eq("user_id", user.id)
        .order("connected_at", { ascending: false });

      setWorkspaces((data as HubspotConnection[]) ?? []);
    }
    load();
  }, [connected]); // recharge après connexion réussie

  const handleAudit = useCallback(
    async (connectionId: string) => {
      setAuditing(connectionId);
      setAuditError(null);
      try {
        const res = await fetch("/api/audit/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId }),
        });
        if (res.ok) {
          const data = await res.json();
          router.push(`/audit/${data.auditId}`);
        } else {
          const data = await res.json().catch(() => ({}));
          setAuditError(data.error ?? "L'audit a échoué. Veuillez réessayer.");
        }
      } catch {
        setAuditError("Erreur réseau. Veuillez réessayer.");
      } finally {
        setAuditing(null);
      }
    },
    [router]
  );

  async function handleDisconnect(connectionId: string) {
    setDisconnecting(connectionId);
    try {
      const res = await fetch("/api/hubspot/oauth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setWorkspaces((prev) => prev.filter((ws) => ws.id !== connectionId));
      } else {
        alert("Erreur lors de la déconnexion. Veuillez réessayer.");
      }
    } catch {
      alert("Erreur réseau. Veuillez réessayer.");
    } finally {
      setDisconnecting(null);
    }
  }

  const errorMessages: Record<string, string> = {
    access_denied: "Vous avez refusé l'accès à HubSpot.",
    state_invalid: "Session expirée ou invalide. Veuillez réessayer.",
    oauth_failed: "La connexion HubSpot a échoué. Veuillez réessayer.",
    db_error: "Erreur lors de la sauvegarde de la connexion.",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900">
            HubSpot Auditor
          </Link>
          <span className="text-sm text-gray-600">{userEmail}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Alertes */}
        {connected === "true" && (
          <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            Workspace HubSpot connecté avec succès.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {errorMessages[error] ?? "Une erreur est survenue."}
          </div>
        )}
        {auditError && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {auditError}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes workspaces</h2>
            <p className="mt-1 text-gray-600">Gérez vos connexions HubSpot</p>
          </div>
          <a
            href="/api/hubspot/oauth/initiate"
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            + Ajouter un workspace
          </a>
        </div>

        {workspaces.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-white p-12 text-center">
            <p className="text-gray-600">Aucun workspace connecté.</p>
            <p className="mt-2 text-sm text-gray-500">
              Cliquez sur &quot;Ajouter un workspace&quot; pour connecter votre compte HubSpot.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaces.map((ws) => {
              const isExpired =
                ws.token_expires_at && new Date(ws.token_expires_at) < new Date();
              return (
                <div
                  key={ws.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-5 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {ws.portal_name ?? `Portal ${ws.portal_id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hub ID : {ws.portal_id}
                      {ws.hub_domain && ` · ${ws.hub_domain}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Connecté le{" "}
                      {new Date(ws.connected_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isExpired
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isExpired ? "Expiré" : "Actif"}
                    </span>
                    <button
                      onClick={() => handleAudit(ws.id)}
                      disabled={!!auditing || isExpired === true}
                      className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {auditing === ws.id ? (
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent" />
                          Analyse…
                        </span>
                      ) : (
                        "Lancer un audit"
                      )}
                    </button>
                    <button
                      onClick={() => handleDisconnect(ws.id)}
                      disabled={disconnecting === ws.id}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {disconnecting === ws.id ? "Déconnexion…" : "Déconnecter"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function WorkspacesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <WorkspacesContent />
    </Suspense>
  );
}
