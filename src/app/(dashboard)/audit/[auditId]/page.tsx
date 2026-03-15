import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditResults, WorkflowAuditResults } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuditRun {
  id: string;
  status: string;
  results: AuditResults | null;
  workflow_results: WorkflowAuditResults | null;
  global_score: number | null;
  llm_summary: string | null;
  share_token: string | null;
  portal_name: string | null;
  execution_duration_ms: number | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
}

export default async function AuditPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: audit } = await supabase
    .from("audit_runs")
    .select("id, status, results, workflow_results, global_score, llm_summary, share_token, portal_name, execution_duration_ms, error, started_at, completed_at")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single<AuditRun>();

  if (!audit) redirect("/dashboard");

  const globalScore = audit.global_score ?? audit.results?.score;
  const globalScoreLabel =
    globalScore !== undefined && globalScore !== null
      ? getScoreLabel(globalScore)
      : undefined;

  return (
    <>
      {audit.status === "failed" && (
        <Card className="border-red-500/30 bg-[rgba(239,68,68,0.08)]">
          <div className="flex items-start gap-3">
            <CircleX className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-300 mb-2">L&apos;audit a échoué</h2>
              <p className="text-sm text-red-200/80">{audit.error ?? "Une erreur inattendue s'est produite."}</p>
              <Link href="/dashboard" className="mt-4 inline-block">
                <Button variant="secondary" size="sm">Retour au dashboard</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {(audit.status === "running" || !audit.results) && audit.status !== "failed" && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500 mx-auto" />
            <div>
              <p className="text-gray-200 font-medium">Audit en cours…</p>
              <p className="text-sm text-gray-500 mt-1">
                {audit.portal_name && `Analyse de ${audit.portal_name}`}
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-400 max-w-xs mx-auto text-left">
              <p>Analyse des propriétés…</p>
              <p>Analyse des contacts et companies…</p>
              <p>Analyse des workflows…</p>
              <p>Génération du rapport…</p>
            </div>
          </div>
        </div>
      )}

      {audit.status === "completed" && audit.results && (
        <AuditResultsView
          r={audit.results}
          w={audit.workflow_results}
          globalScore={globalScore}
          globalScoreLabel={globalScoreLabel}
          llmSummary={audit.llm_summary}
          shareToken={audit.share_token}
          portalName={audit.portal_name}
          startedAt={audit.started_at}
          executionDurationMs={audit.execution_duration_ms}
        />
      )}
    </>
  );
}

function getScoreLabel(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}
