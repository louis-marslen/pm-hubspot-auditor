import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuditResults, WorkflowAuditResults } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";

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

  if (!audit) redirect("/workspaces");

  // Score global affiché : global_score si disponible, sinon score propriétés
  const globalScore = audit.global_score ?? audit.results?.score;
  const globalScoreLabel =
    globalScore !== undefined && globalScore !== null
      ? getScoreLabel(globalScore)
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/workspaces" className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors">
            HubSpot Auditor
          </Link>
          <Link href="/workspaces" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour aux workspaces
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {audit.status === "failed" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">L&apos;audit a échoué</h2>
            <p className="text-sm text-red-700">{audit.error ?? "Une erreur inattendue s'est produite."}</p>
          </div>
        )}

        {(audit.status === "running" || !audit.results) && audit.status !== "failed" && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-r-transparent mb-4" />
              <p className="text-gray-600">Audit en cours…</p>
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
      </main>
    </div>
  );
}

function getScoreLabel(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}
