import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, DealAuditResults, LeadAuditResults, type AuditDomainSelection } from "@/lib/audit/types";
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

  const { data: audit } = await supabase
    .from("audit_runs")
    .select("id, results, workflow_results, contact_results, company_results, user_results, deal_results, lead_results, global_score, llm_summary, portal_name, execution_duration_ms, started_at, audit_domains")
    .eq("share_token", shareToken)
    .eq("status", "completed")
    .single<SharedAuditRun>();

  if (!audit || !audit.results) notFound();

  const globalScore = audit.global_score ?? audit.results.score;
  const globalScoreLabel = getScoreLabel(globalScore);
  const dateStr = new Date(audit.started_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

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

      <main className="mx-auto max-w-content px-6 py-8">
        {/* Public banner */}
        <div className="mb-6 rounded-lg bg-gray-900 border border-gray-700 px-5 py-4">
          <p className="text-lg font-semibold text-gray-100">Rapport d&apos;audit HubSpot</p>
          <p className="text-sm text-gray-400 mt-1">
            {audit.portal_name && <>{audit.portal_name} · </>}
            Généré le {dateStr}
          </p>
          <p className="text-xs text-gray-500 mt-2">Rapport en lecture seule</p>
        </div>

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
