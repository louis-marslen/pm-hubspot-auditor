import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, DealAuditResults, LeadAuditResults, type AuditDomainSelection, type AIDiagnostic } from "@/lib/audit/types";
import { AuditResultsView } from "@/components/audit/audit-results-view";
import Link from "next/link";

interface SharedAuditRun {
  id: string;
  results: AuditResults;
  workflow_results: WorkflowAuditResults | null;
  contact_results: ContactAuditResults | null;
  company_results: CompanyAuditResults | null;
  user_results: UserAuditResults | null;
  deal_results: DealAuditResults | null;
  lead_results: LeadAuditResults | null;
  global_score: number | null;
  llm_summary: string | null;
  ai_diagnostic: AIDiagnostic | null;
  portal_name: string | null;
  execution_duration_ms: number | null;
  started_at: string;
  audit_domains: AuditDomainSelection | null;
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

  // Essai avec ai_diagnostic, fallback sans si la colonne n'existe pas encore (migration 011)
  let audit: SharedAuditRun | null = null;
  {
    const { data, error } = await supabase
      .from("audit_runs")
      .select("id, results, workflow_results, contact_results, company_results, user_results, deal_results, lead_results, global_score, llm_summary, ai_diagnostic, portal_name, execution_duration_ms, started_at, audit_domains")
      .eq("share_token", shareToken)
      .eq("status", "completed")
      .single<SharedAuditRun>();

    if (data) {
      audit = data;
    } else if (error?.message?.includes("ai_diagnostic")) {
      const { data: fallback } = await supabase
        .from("audit_runs")
        .select("id, results, workflow_results, contact_results, company_results, user_results, deal_results, lead_results, global_score, llm_summary, portal_name, execution_duration_ms, started_at, audit_domains")
        .eq("share_token", shareToken)
        .eq("status", "completed")
        .single<Omit<SharedAuditRun, "ai_diagnostic">>();
      if (fallback) {
        audit = { ...fallback, ai_diagnostic: null };
      }
    }
  }

  if (!audit || !audit.results) notFound();

  const globalScore = audit.global_score ?? audit.results.score;
  const globalScoreLabel = getScoreLabel(globalScore);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Public topbar */}
      <header className="h-14 bg-gray-900 border-b border-gray-700 px-6 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-gray-50">HubSpot Auditor</span>
        <Link
          href="/register"
          className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors"
        >
          Auditer mon workspace →
        </Link>
      </header>

      <main>
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
          portalName={audit.portal_name}
          startedAt={audit.started_at}
          executionDurationMs={audit.execution_duration_ms}
          isPublic={true}
          auditDomains={audit.audit_domains}
        />
      </main>
    </div>
  );
}
