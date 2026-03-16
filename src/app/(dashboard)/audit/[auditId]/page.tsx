import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";
import { AuditPageClient } from "./audit-page-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import Link from "next/link";

interface AuditRun {
  id: string;
  status: string;
  results: AuditResults | null;
  workflow_results: WorkflowAuditResults | null;
  contact_results: ContactAuditResults | null;
  company_results: CompanyAuditResults | null;
  user_results: UserAuditResults | null;
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
    .select("id, status, results, workflow_results, contact_results, company_results, user_results, global_score, llm_summary, share_token, portal_name, execution_duration_ms, error, started_at, completed_at")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single<AuditRun>();

  if (!audit) redirect("/dashboard");

  // Si l'audit est en cours, afficher le tracker client-side avec polling
  if (audit.status === "running") {
    return (
      <AuditPageClient
        auditId={auditId}
        portalName={audit.portal_name}
      />
    );
  }

  // Si l'audit a échoué, afficher l'erreur avec le tracker en état d'erreur
  if (audit.status === "failed") {
    return (
      <AuditPageClient
        auditId={auditId}
        portalName={audit.portal_name}
        initialStatus="failed"
        errorMessage={audit.error}
      />
    );
  }

  // Audit terminé — afficher le rapport directement (SSR)
  const globalScore = audit.global_score ?? audit.results?.score;
  const globalScoreLabel =
    globalScore !== undefined && globalScore !== null
      ? getScoreLabel(globalScore)
      : undefined;

  return (
    <>
      {audit.results && (
        <AuditResultsView
          r={audit.results}
          w={audit.workflow_results}
          c={audit.contact_results}
          co={audit.company_results}
          u={audit.user_results}
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
