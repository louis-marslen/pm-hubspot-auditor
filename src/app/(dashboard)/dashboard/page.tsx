"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { ScanSearch, Building2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreCircle } from "@/components/ui/score-circle";

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
  global_score: number | null;
  total_critiques: number;
  total_avertissements: number;
  started_at: string;
  connection_id: string;
  portal_name: string | null;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditRun[]>([]);
  const [auditing, setAuditing] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const connected = searchParams.get("connected");
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    access_denied: "Vous avez refusé l'accès à HubSpot.",
    state_invalid: "Session expirée ou invalide. Veuillez réessayer.",
    oauth_failed: "La connexion HubSpot a échoué. Veuillez réessayer.",
    db_error: "Erreur lors de la sauvegarde de la connexion.",
  };

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: wsList }, { data: auditList }] = await Promise.all([
        supabase
          .from("hubspot_connections")
          .select("id, portal_id, portal_name, hub_domain, token_expires_at")
          .eq("user_id", user.id)
          .order("connected_at", { ascending: false }),
        supabase
          .from("audit_runs")
          .select("id, status, score, global_score, total_critiques, total_avertissements, started_at, connection_id")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(10),
      ]);

      const wss = (wsList ?? []) as Workspace[];
      setWorkspaces(wss);

      const wsMap = Object.fromEntries(wss.map((w) => [w.id, w.portal_name]));
      const audits = ((auditList ?? []) as Omit<AuditRun, "portal_name">[]).map((a) => ({
        ...a,
        portal_name: wsMap[a.connection_id] ?? null,
      }));
      setRecentAudits(audits);
      setLoading(false);
    }
    load();
  }, [router, connected]);

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

  // Get last audit per workspace
  const lastAuditByWs = new Map<string, AuditRun>();
  for (const a of recentAudits) {
    if (a.status === "completed" && !lastAuditByWs.has(a.connection_id)) {
      lastAuditByWs.set(a.connection_id, a);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  // Empty state: no workspaces
  if (workspaces.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={ScanSearch}
          title="Bienvenue sur HubSpot Auditor !"
          description="Connectez votre workspace HubSpot pour obtenir un diagnostic complet de la qualité de vos données et automatisations."
          action={
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-300">1</div>
                  <span>Connecter HubSpot</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-300">2</div>
                  <span>Auditer</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-600" />
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-300">3</div>
                  <span>Partager le rapport</span>
                </div>
              </div>
              <a href="/api/hubspot/oauth/initiate">
                <Button size="lg">Connecter mon workspace HubSpot</Button>
              </a>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* OAuth feedback */}
      {connected === "true" && (
        <Alert type="success">Workspace HubSpot connecté avec succès.</Alert>
      )}
      {error && (
        <Alert type="error">{errorMessages[error] ?? "Une erreur est survenue."}</Alert>
      )}
      {auditError && <Alert type="error">{auditError}</Alert>}

      {/* Workspaces */}
      <section>
        <h2 className="text-lg font-semibold text-gray-100 mb-5">Mes workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workspaces.map((ws) => {
            const isExpired = ws.token_expires_at && new Date(ws.token_expires_at) < new Date();
            const lastAudit = lastAuditByWs.get(ws.id);
            const isRunning = auditing === ws.id;

            return (
              <Card key={ws.id}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={isExpired ? "critique" : "succes"}>
                    {isExpired ? "Expiré" : "Actif"}
                  </Badge>
                  <span className="text-caption text-gray-500">Hub {ws.portal_id}</span>
                </div>

                <h3 className="text-[15px] font-semibold text-gray-100 mb-1">
                  {ws.portal_name ?? `Portal ${ws.portal_id}`}
                </h3>
                {ws.hub_domain && (
                  <p className="text-xs text-gray-500 mb-4">{ws.hub_domain}</p>
                )}

                {lastAudit && (lastAudit.global_score ?? lastAudit.score) !== null && (
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-md bg-gray-800/50">
                    <ScoreCircle score={(lastAudit.global_score ?? lastAudit.score)!} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">{lastAudit.global_score ?? lastAudit.score}/100</p>
                      <p className="text-xs text-gray-500">
                        {new Date(lastAudit.started_at).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {isExpired ? (
                  <a href="/api/hubspot/oauth/initiate" className="block">
                    <Button variant="secondary" className="w-full" size="sm">
                      Reconnecter
                    </Button>
                  </a>
                ) : (
                  <Button
                    onClick={() => handleAudit(ws.id)}
                    disabled={!!auditing}
                    loading={isRunning}
                    className="w-full"
                    size="sm"
                  >
                    {lastAudit ? "Relancer un audit" : "Lancer mon premier audit"}
                  </Button>
                )}
              </Card>
            );
          })}

          {/* Add workspace card */}
          <Card variant="dashed" className="flex flex-col items-center justify-center min-h-[200px]">
            <a
              href="/api/hubspot/oauth/initiate"
              className="flex flex-col items-center gap-3 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Connecter un workspace HubSpot</span>
            </a>
          </Card>
        </div>
      </section>

      {/* Recent audits */}
      {recentAudits.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-100 mb-5">Historique des audits</h2>
          <Card padding="compact" className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-850">
                  <th className="px-4 py-3 text-left text-caption font-medium text-gray-400 uppercase tracking-wider">Workspace</th>
                  <th className="px-4 py-3 text-left text-caption font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-caption font-medium text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-4 py-3 text-left text-caption font-medium text-gray-400 uppercase tracking-wider">Problèmes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-850 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-200">
                      {audit.portal_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(audit.started_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {audit.status === "running" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-500 border-r-transparent" />
                          En cours…
                        </span>
                      ) : audit.status === "failed" ? (
                        <Badge variant="critique">Échoué</Badge>
                      ) : (audit.global_score ?? audit.score) !== null ? (
                        <Badge
                          variant={
                            (audit.global_score ?? audit.score)! <= 49 ? "critique" :
                            (audit.global_score ?? audit.score)! <= 69 ? "avertissement" :
                            "succes"
                          }
                        >
                          {audit.global_score ?? audit.score}/100
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {audit.status === "completed" ? (
                        <span className="flex items-center gap-2">
                          {audit.total_critiques > 0 && (
                            <span className="text-red-400 font-medium">{audit.total_critiques}C</span>
                          )}
                          {audit.total_avertissements > 0 && (
                            <span className="text-amber-400 font-medium">{audit.total_avertissements}A</span>
                          )}
                          {audit.total_critiques === 0 && audit.total_avertissements === 0 && "—"}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(audit.status === "completed" || audit.status === "running") && (
                        <Link
                          href={`/audit/${audit.id}`}
                          className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors"
                        >
                          {audit.status === "running" ? "Suivre →" : "Voir →"}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
