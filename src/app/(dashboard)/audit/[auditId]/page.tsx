import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, DealAuditResults, LeadAuditResults, type AuditDomainSelection, type AIDiagnostic } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";
import { AuditPageClient } from "./audit-page-client";
import { fetchScoreDelta } from "@/lib/report/compute-score-delta";

interface AuditRun {
  id: string;
  status: string;
  connection_id: string;
  results: AuditResults | null;
  workflow_results: WorkflowAuditResults | null;
  contact_results: ContactAuditResults | null;
  company_results: CompanyAuditResults | null;
  user_results: UserAuditResults | null;
  deal_results: DealAuditResults | null;
  lead_results: LeadAuditResults | null;
  global_score: number | null;
  llm_summary: string | null;
  ai_diagnostic: AIDiagnostic | null;
  share_token: string | null;
  portal_name: string | null;
  execution_duration_ms: number | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  audit_domains: AuditDomainSelection | null;
}

export default async function AuditPage({ params }: { params: Promise<{ auditId: string }> }) {
  const { auditId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Essai avec ai_diagnostic, fallback sans si la colonne n'existe pas encore (migration 011)
  let audit: AuditRun | null = null;
  {
    const { data, error } = await supabase
      .from("audit_runs")
      .select("id, status, connection_id, results, workflow_results, contact_results, company_results, user_results, deal_results, lead_results, global_score, llm_summary, ai_diagnostic, share_token, portal_name, execution_duration_ms, error, started_at, completed_at, audit_domains")
      .eq("id", auditId)
      .eq("user_id", user.id)
      .single<AuditRun>();

    if (data) {
      audit = data;
    } else if (error?.message?.includes("ai_diagnostic")) {
      // Colonne pas encore créée — requête sans ai_diagnostic
      const { data: fallback } = await supabase
        .from("audit_runs")
        .select("id, status, connection_id, results, workflow_results, contact_results, company_results, user_results, deal_results, lead_results, global_score, llm_summary, share_token, portal_name, execution_duration_ms, error, started_at, completed_at, audit_domains")
        .eq("id", auditId)
        .eq("user_id", user.id)
        .single<Omit<AuditRun, "ai_diagnostic">>();
      if (fallback) {
        audit = { ...fallback, ai_diagnostic: null };
      }
    }
  }

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

  // Fetch score delta vs previous audit (best-effort, non-blocking)
  let scoreDelta: number | null = null;
  if (globalScore != null) {
    try {
      scoreDelta = await fetchScoreDelta(audit.connection_id, audit.id, globalScore);
    } catch {
      // Non-critical — silently ignore
    }
  }

  return (
    <>
      {audit.results && (
        <AuditResultsView
          r={audit.results}
          w={audit.workflow_results}
          c={audit.contact_results}
          co={audit.company_results}
          u={audit.user_results}
          d={audit.deal_results}
          l={audit.lead_results}
          globalScore={globalScore}
          globalScoreLabel={globalScoreLabel}
          llmSummary={audit.llm_summary}
          aiDiagnostic={audit.ai_diagnostic}
          shareToken={audit.share_token}
          portalName={audit.portal_name}
          startedAt={audit.started_at}
          executionDurationMs={audit.execution_duration_ms}
          auditDomains={audit.audit_domains}
          scoreDelta={scoreDelta}
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
