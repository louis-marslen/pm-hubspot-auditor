"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Workspace {
  id: string;
  portal_id: string;
  portal_name: string | null;
  hub_domain: string | null;
  token_expires_at: string | null;
}

interface AuditRun {
  id: string;
  status: string;
  score: number | null;
  total_critiques: number;
  total_avertissements: number;
  started_at: string;
  connection_id: string;
  portal_name: string | null;
}

function ScoreBadge({ score, status }: { score: number | null; status: string }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-r-transparent" />
        En cours…
      </span>
    );
  }
  if (status === "failed") {
    return <span className="text-xs text-red-600 font-medium">Échoué</span>;
  }
  if (score === null) return null;
  const color =
    score <= 40 ? "bg-red-100 text-red-700" :
    score <= 70 ? "bg-orange-100 text-orange-700" :
    score <= 90 ? "bg-yellow-100 text-yellow-700" :
    "bg-green-100 text-green-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditRun[]>([]);
  const [auditing, setAuditing] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? "");

      const [{ data: wsList }, { data: auditList }] = await Promise.all([
        supabase
          .from("hubspot_connections")
          .select("id, portal_id, portal_name, hub_domain, token_expires_at")
          .eq("user_id", user.id)
          .order("connected_at", { ascending: false }),
        supabase
          .from("audit_runs")
          .select("id, status, score, total_critiques, total_avertissements, started_at, connection_id")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(10),
      ]);

      const wss = (wsList ?? []) as Workspace[];
      setWorkspaces(wss);

      // Enrichit les audits avec le nom du portal
      const wsMap = Object.fromEntries(wss.map((w) => [w.id, w.portal_name]));
      const audits = ((auditList ?? []) as Omit<AuditRun, "portal_name">[]).map((a) => ({
        ...a,
        portal_name: wsMap[a.connection_id] ?? null,
      }));
      setRecentAudits(audits);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleAudit = useCallback(async (connectionId: string) => {
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
  }, [router]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">HubSpot Auditor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-10">

        {auditError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {auditError}
          </div>
        )}

        {/* Workspaces */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mes workspaces</h2>
            <a
              href="/api/hubspot/oauth/initiate"
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
            >
              + Connecter un workspace
            </a>
          </div>

          {workspaces.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-10 text-center">
              <p className="text-gray-600 font-medium">Aucun workspace connecté</p>
              <p className="mt-1 text-sm text-gray-500">Connectez votre compte HubSpot pour lancer votre premier audit.</p>
              <a
                href="/api/hubspot/oauth/initiate"
                className="mt-4 inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Connecter HubSpot
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaces.map((ws) => {
                const isExpired = ws.token_expires_at && new Date(ws.token_expires_at) < new Date();
                return (
                  <div key={ws.id} className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {ws.portal_name ?? `Portal ${ws.portal_id}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hub ID : {ws.portal_id}
                        {ws.hub_domain && ` · ${ws.hub_domain}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
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
                        ) : "Lancer un audit"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Audits récents */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Audits récents</h2>

          {recentAudits.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-10 text-center">
              <p className="text-gray-600">Aucun audit lancé pour l&apos;instant.</p>
              <p className="mt-1 text-sm text-gray-500">Cliquez sur &quot;Lancer un audit&quot; depuis un workspace.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Workspace</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Problèmes</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {audit.portal_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(audit.started_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={audit.score} status={audit.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {audit.status === "completed" ? (
                          <span>
                            <span className="text-red-600 font-medium">{audit.total_critiques}</span>
                            <span className="text-gray-400 mx-1">·</span>
                            <span className="text-orange-500 font-medium">{audit.total_avertissements}</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {audit.status === "completed" && (
                          <a
                            href={`/audit/${audit.id}`}
                            className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                          >
                            Voir →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
