import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditResults, WorkflowAuditResults } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";

interface SharedAuditRun {
  id: string;
  results: AuditResults;
  workflow_results: WorkflowAuditResults | null;
  global_score: number | null;
  llm_summary: string | null;
  portal_name: string | null;
  execution_duration_ms: number | null;
  started_at: string;
}

function getScoreLabel(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}

export default async function SharePage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const supabase = await createClient();

  const { data: audit } = await supabase
    .from("audit_runs")
    .select("id, results, workflow_results, global_score, llm_summary, portal_name, execution_duration_ms, started_at")
    .eq("share_token", shareToken)
    .eq("status", "completed")
    .single<SharedAuditRun>();

  if (!audit || !audit.results) notFound();

  const globalScore = audit.global_score ?? audit.results.score;
  const globalScoreLabel = getScoreLabel(globalScore);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Ce rapport est partagé en lecture seule. Les données HubSpot affichées ne sont pas modifiées par HubSpot Auditor.
      </div>

      <AuditResultsView
        r={audit.results}
        w={audit.workflow_results}
        globalScore={globalScore}
        globalScoreLabel={globalScoreLabel}
        llmSummary={audit.llm_summary}
        portalName={audit.portal_name}
        startedAt={audit.started_at}
        executionDurationMs={audit.execution_duration_ms}
        isPublic={true}
      />
    </main>
  );
}
