"use client";

import { useState } from "react";
import {
  AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, DealAuditResults, LeadAuditResults,
  WorkflowIssue, PropertyIssue, PropertyPair, TypingIssue, DealIssue, PipelineStageIssue,
  RateResult, ContactIssue, DuplicateCluster, CompanyIssue, CompanyDuplicateCluster,
  UserIssue, TeamIssue, RoleDistribution,
  DealDetailIssue, BlockedDealGroup, PipelineRuleResult, StageRuleResult,
  LeadIssue, LeadBlockedGroup, LeadPipelineRuleResult, LeadStageRuleResult,
  AUDIT_DOMAINS, type AuditDomainSelection,
} from "@/lib/audit/types";
import { BUSINESS_IMPACTS } from "@/lib/audit/business-impact";
import { PaginatedList } from "@/components/audit/paginated-list";
import { ScoreCircle, getScoreBg } from "@/components/ui/score-circle";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Tabs } from "@/components/ui/tabs";
import { ChevronDown, CircleCheck, Share2, ArrowLeft, Sparkles, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function RuleCard({
  title, ruleKey, severity, isEmpty, count, children, defaultOpen = false,
  rateResult,
}: {
  title: string; ruleKey: string; severity: "critique" | "avertissement" | "info";
  isEmpty: boolean; count?: number; children: React.ReactNode; defaultOpen?: boolean;
  rateResult?: RateResult;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const impact = BUSINESS_IMPACTS[ruleKey];

  if (isEmpty) {
    return (
      <Card padding="compact">
        <div className="flex items-center gap-3 px-5 py-4">
          <CircleCheck className="h-4 w-4 text-green-400" />
          <SeverityBadge severity="ok" />
          <span className="text-caption text-gray-500 uppercase tracking-wide">{ruleKey.toUpperCase()}</span>
          <span className="text-sm font-medium text-gray-300">{title}</span>
          <span className="ml-auto text-xs text-gray-500">0 trouvé</span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="compact">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <SeverityBadge severity={severity} />
        <span className="text-caption text-gray-500 uppercase tracking-wide">{ruleKey.toUpperCase()}</span>
        <span className="text-sm font-medium text-gray-200 flex-1">{title}</span>

        {rateResult && (
          <span className="text-sm tabular-nums font-medium text-gray-100 mr-2">
            {Math.round(rateResult.rate * 100)}%
          </span>
        )}

        {count !== undefined && count > 0 && (
          <span className="text-xs text-gray-400">{count} trouvé{count !== 1 ? "s" : ""}</span>
        )}

        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {rateResult && !open && (
        <div className="px-5 pb-3">
          <ProgressBar
            value={Math.round(rateResult.rate * 100)}
            threshold={Math.round(rateResult.threshold * 100)}
          />
        </div>
      )}

      {open && (
        <div className="px-5 pb-5 border-t border-gray-700">
          <div className="pt-4">
            {rateResult && (
              <div className="mb-4">
                <ProgressBar
                  value={Math.round(rateResult.rate * 100)}
                  threshold={Math.round(rateResult.threshold * 100)}
                  className="mb-2"
                />
                <p className="text-xs text-gray-400">
                  {rateResult.filledCount.toLocaleString("fr-FR")} / {rateResult.totalCount.toLocaleString("fr-FR")} — seuil : {Math.round(rateResult.threshold * 100)}%
                </p>
              </div>
            )}
            {children}
          </div>
          {impact && (
            <div className="mt-4 rounded-md bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] p-3">
              <p className="text-xs font-semibold text-amber-300 mb-1">Impact business</p>
              <p className="text-xs text-amber-200/80">{impact.estimation}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function WorkflowIssueRow({ wf }: { wf: WorkflowIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-200">{wf.name}</span>
        {wf.isLegacy && (
          <Badge variant="neutre" className="ml-2">Ancien format</Badge>
        )}
        {wf.notAnalyzed && (
          <Badge variant="critique" className="ml-2">Non analysé</Badge>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        <Badge variant={wf.status === "ACTIVE" ? "succes" : "neutre"}>
          {wf.status === "ACTIVE" ? "Actif" : "Inactif"}
        </Badge>
        {wf.errorRate !== null && (
          <span className="text-red-400 font-medium">{wf.errorRate}% d&apos;erreurs</span>
        )}
      </div>
    </div>
  );
}

function ContactIssueRow({ contact }: { contact: ContactIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-200">{contact.name}</span>
        {contact.email && (
          <span className="ml-2 text-xs text-gray-500">{contact.email}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        {contact.lifecycleStage && (
          <Badge variant="neutre">{contact.lifecycleStage}</Badge>
        )}
        <span>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    </div>
  );
}

function DuplicateClusterRow({ cluster }: { cluster: DuplicateCluster }) {
  const [expanded, setExpanded] = useState(false);
  const criterionLabels: Record<string, string> = {
    email: "Email",
    name_company: "Nom + Company",
    phone: "Téléphone",
  };

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800/50 text-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="neutre">{criterionLabels[cluster.criterion]}</Badge>
          <span className="font-medium text-gray-200 truncate">{cluster.normalizedValue}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-amber-400 font-medium">{cluster.size} contacts</span>
          <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-2 space-y-1 border-t border-gray-700 pt-2">
          {cluster.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs text-gray-400">
              <span>
                <span className="text-gray-300">{m.name}</span>
                {m.email && <span className="ml-2">{m.email}</span>}
                {m.phone && <span className="ml-2">{m.phone}</span>}
              </span>
              <span>{m.createdAt ? new Date(m.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyIssueRow({ company }: { company: CompanyIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-200">{company.name}</span>
        {company.domain && (
          <span className="ml-2 text-xs text-gray-500">{company.domain}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        {company.industry && (
          <Badge variant="neutre">{company.industry}</Badge>
        )}
        {company.contactCount > 0 && (
          <span>{company.contactCount} contact{company.contactCount !== 1 ? "s" : ""}</span>
        )}
        <span>{company.createdAt ? new Date(company.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    </div>
  );
}

function CompanyDuplicateClusterRow({ cluster }: { cluster: CompanyDuplicateCluster }) {
  const [expanded, setExpanded] = useState(false);
  const criterionLabels: Record<string, string> = {
    domain: "Domain",
    name: "Nom",
  };

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800/50 text-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="neutre">{criterionLabels[cluster.criterion]}</Badge>
          <span className="font-medium text-gray-200 truncate">{cluster.normalizedValue}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-amber-400 font-medium">{cluster.size} companies</span>
          <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-3 pb-2 space-y-1 border-t border-gray-700 pt-2">
          {cluster.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs text-gray-400">
              <span>
                <span className="text-gray-300">{m.name}</span>
                {m.domain && <span className="ml-2">{m.domain}</span>}
              </span>
              <span className="flex items-center gap-2">
                {m.contactCount > 0 && <span>{m.contactCount} contact{m.contactCount !== 1 ? "s" : ""}</span>}
                {m.dealCount > 0 && <span>{m.dealCount} deal{m.dealCount !== 1 ? "s" : ""}</span>}
                <span>{m.createdAt ? new Date(m.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserIssueRow({ user }: { user: UserIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-200">{user.name}</span>
        <span className="ml-2 text-xs text-gray-500">{user.email}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        <Badge variant="neutre">{user.role}</Badge>
        {user.teamName && <span>{user.teamName}</span>}
        <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    </div>
  );
}

function RecommendationCard({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border-l-4 border-blue-500/30 bg-gray-800/40 border border-gray-700">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <Info className="h-4 w-4 text-blue-400 shrink-0" />
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{id}</span>
        <span className="text-sm font-medium text-gray-200 flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-700 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface AuditResultsViewProps {
  r: AuditResults;
  w?: WorkflowAuditResults | null;
  c?: ContactAuditResults | null;
  co?: CompanyAuditResults | null;
  u?: UserAuditResults | null;
  d?: DealAuditResults | null;
  l?: LeadAuditResults | null;
  globalScore?: number;
  globalScoreLabel?: string;
  llmSummary?: string | null;
  shareToken?: string | null;
  isPublic?: boolean;
  portalName?: string | null;
  startedAt: string;
  executionDurationMs?: number | null;
  auditDomains?: AuditDomainSelection | null;
}

// ─── Triggered rule counting (rules, not items) ─────────────────────────────

type Sev = "critique" | "avertissement" | "info";
interface TriggeredCounts { critiques: number; avertissements: number; infos: number; total: number }

function isTriggered(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object" && "triggered" in v) return !!(v as { triggered: boolean }).triggered;
  if (typeof v === "object" && "count" in v) return (v as { count: number }).count > 0;
  if (typeof v === "object" && "disabled" in v && "deals" in v) {
    const obj = v as { disabled: boolean; deals: unknown[] };
    return !obj.disabled && obj.deals.length > 0;
  }
  if (typeof v === "object" && "inactiveUsers" in v) return (v as { inactiveUsers: unknown[] }).inactiveUsers.length > 0;
  return false;
}

function countTriggered(rules: [unknown, Sev][]): TriggeredCounts {
  let critiques = 0, avertissements = 0, infos = 0;
  for (const [val, sev] of rules) {
    if (!isTriggered(val)) continue;
    if (sev === "critique") critiques++;
    else if (sev === "avertissement") avertissements++;
    else infos++;
  }
  return { critiques, avertissements, infos, total: critiques + avertissements + infos };
}

function countPropertyRules(r: AuditResults): TriggeredCounts {
  return countTriggered([
    [r.p1, "critique"], [r.p2, "avertissement"], [r.p3, "avertissement"],
    [r.p4, "info"], [r.p5, "info"], [r.p6, "avertissement"],
  ]);
}

function countContactRules(c: ContactAuditResults): TriggeredCounts {
  return countTriggered([
    [c.c01, "critique"], [c.c02, "critique"], [c.c03, "avertissement"],
    [c.c04a, "avertissement"], [c.c04b, "info"], [c.c04c, "avertissement"], [c.c04d, "info"],
    [c.c05, "info"], [c.c06, "critique"], [c.c07, "avertissement"], [c.c08, "avertissement"],
    [c.c09, "avertissement"], [c.c10, "info"], [c.c11, "info"], [c.c12, "info"],
  ]);
}

function countCompanyRules(co: CompanyAuditResults): TriggeredCounts {
  return countTriggered([
    [co.co01, "critique"], [co.co02, "critique"], [co.co03, "avertissement"],
    [co.co04, "avertissement"], [co.co05, "info"], [co.co06, "info"],
    [co.co07, "info"], [co.co08, "info"],
  ]);
}

function countDealRules(d: DealAuditResults): TriggeredCounts {
  return countTriggered([
    [d.d01, "critique"], [d.d02, "critique"], [d.d03, "avertissement"],
    [d.d04.reduce((s, g) => s + g.deals.length, 0) > 0 ? { triggered: true } : { triggered: false }, "critique"],
    [d.d05.reduce((s, g) => s + g.deals.length, 0) > 0 ? { triggered: true } : { triggered: false }, "avertissement"],
    [d.d06, "info"], [d.d07, "info"],
    [d.d08, "info"], [d.d09, "avertissement"], [d.d10, "info"], [d.d11, "avertissement"],
    [d.d12, "avertissement"], [d.d13, "avertissement"], [d.d14, "avertissement"], [d.d15, "info"],
  ]);
}

function countLeadRules(l: LeadAuditResults): TriggeredCounts {
  return countTriggered([
    [l.l01, "avertissement"], [l.l02.reduce((s, g) => s + g.leads.length, 0) > 0 ? { triggered: true } : { triggered: false }, "avertissement"],
    [l.l03, "info"], [l.l04, "critique"],
    [l.l05, "info"], [l.l06, "info"],
    [l.l07, "avertissement"], [l.l08, "avertissement"], [l.l09, "avertissement"], [l.l10, "info"],
    [l.l11.triggered ? { triggered: true } : { triggered: false }, "avertissement"],
    [l.l12.triggered && !l.l12.disabled ? { triggered: true } : { triggered: false }, "info"],
    [l.l13.triggered ? { triggered: true } : { triggered: false }, "critique"],
    [l.l14, "avertissement"],
  ]);
}

function countWorkflowRules(w: WorkflowAuditResults): TriggeredCounts {
  return countTriggered([
    [w.w1, "critique"], [w.w2, "critique"], [w.w3, "avertissement"],
    [w.w4, "avertissement"], [w.w5, "info"], [w.w6, "info"], [w.w7, "info"],
  ]);
}

function countUserRules(u: UserAuditResults): TriggeredCounts {
  return countTriggered([
    [u.u01, "avertissement"], [u.u02, "critique"], [u.u03, "avertissement"],
    [u.u04, "avertissement"], [u.u05, "critique"], [u.u06, "info"], [u.u07, "info"],
  ]);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuditResultsView({
  r, w, c, co, u, d, l, globalScore, globalScoreLabel, llmSummary,
  shareToken, isPublic, portalName, startedAt, executionDurationMs, auditDomains,
}: AuditResultsViewProps) {
  const displayScore = globalScore ?? r.score;
  const displayLabel = globalScoreLabel ?? r.scoreLabel;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");

  function handleCopyLink() {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  // Compter les règles déclenchées (pas les occurrences individuelles)
  const propRules = countPropertyRules(r);
  const contactRules = c?.hasContacts ? countContactRules(c) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };
  const companyRules = co?.hasCompanies ? countCompanyRules(co) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };
  const dealRules = d?.hasDeals ? countDealRules(d) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };
  const leadRules = l?.hasLeads && !l.scopeError ? countLeadRules(l) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };
  const workflowRules = w?.hasWorkflows ? countWorkflowRules(w) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };
  const userRules = u?.hasUsers && !u.scopeError ? countUserRules(u) : { critiques: 0, avertissements: 0, infos: 0, total: 0 };

  const totalCritiques = propRules.critiques + contactRules.critiques + companyRules.critiques + dealRules.critiques + leadRules.critiques + workflowRules.critiques + userRules.critiques;
  const totalAvertissements = propRules.avertissements + contactRules.avertissements + companyRules.avertissements + dealRules.avertissements + leadRules.avertissements + workflowRules.avertissements + userRules.avertissements;
  const totalInfos = propRules.infos + contactRules.infos + companyRules.infos + dealRules.infos + leadRules.infos + workflowRules.infos + userRules.infos;

  const dateStr = new Date(startedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Tab counts (nombre de règles déclenchées par domaine)
  const propCount = propRules.total;
  const contactCount = contactRules.total;
  const companyCount = companyRules.total;
  const dealCount = dealRules.total;
  const leadCount = leadRules.total;
  const workflowCount = workflowRules.total;
  const userCount = userRules.total;

  // Determine if a domain was audited (selected or full audit)
  const isDomainAudited = (domainId: string) => !auditDomains || auditDomains.selected.includes(domainId as never);

  // Scope banner data
  const isPartialAudit = !!auditDomains;
  const allImplemented = AUDIT_DOMAINS.filter((d) => d.implemented);
  const auditedLabels = isPartialAudit
    ? auditDomains.selected.map((id) => AUDIT_DOMAINS.find((d) => d.id === id)?.label ?? id)
    : [];
  const nonAuditedLabels = isPartialAudit
    ? allImplemented.filter((d) => !auditDomains.selected.includes(d.id)).map((d) => d.label)
    : [];

  const tabs = [
    { id: "resume", label: "Résumé" },
    { id: "properties", label: "Propriétés", count: propCount > 0 ? propCount : undefined },
    ...(isDomainAudited("contacts") && c?.hasContacts ? [{ id: "contacts", label: "Contacts", count: contactCount > 0 ? contactCount : undefined }] : []),
    ...(isDomainAudited("companies") && co?.hasCompanies ? [{ id: "companies", label: "Companies", count: companyCount > 0 ? companyCount : undefined }] : []),
    ...(isDomainAudited("deals") && d?.hasDeals ? [{ id: "deals", label: "Deals & Pipelines", count: dealCount > 0 ? dealCount : undefined }] : []),
    ...(isDomainAudited("leads") && l?.hasLeads && !l.scopeError ? [{ id: "leads", label: "Leads & Prospection", count: leadCount > 0 ? leadCount : undefined }] : []),
    ...(isDomainAudited("workflows") && w?.hasWorkflows ? [{ id: "workflows", label: "Workflows", count: workflowCount > 0 ? workflowCount : undefined }] : []),
    ...(isDomainAudited("users") && u?.hasUsers ? [{ id: "users", label: "Utilisateurs & Équipes", count: userCount > 0 ? userCount : undefined }] : []),
  ];

  function handleTabChange(id: string) {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">

      {/* Breadcrumb */}
      {!isPublic && (
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: portalName ?? "Workspace" },
          { label: `Audit du ${dateStr}` },
        ]} />
      )}

      {/* Hero score */}
      <Card
        className={`${getScoreBg(displayScore)} border-gray-700`}
        padding="standard"
      >
        <div className="flex items-center gap-8 flex-wrap">
          <ScoreCircle score={displayScore} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-100 mb-1">{displayLabel}</h1>
            <div className="flex gap-3 text-sm mt-2 flex-wrap">
              {totalCritiques > 0 && (
                <span className="text-red-400 font-medium">{totalCritiques} règle{totalCritiques !== 1 ? "s" : ""} critique{totalCritiques !== 1 ? "s" : ""}</span>
              )}
              {totalAvertissements > 0 && (
                <span className="text-amber-400 font-medium">{totalAvertissements} avertissement{totalAvertissements !== 1 ? "s" : ""}</span>
              )}
              {totalInfos > 0 && (
                <span className="text-blue-400 font-medium">{totalInfos} info{totalInfos !== 1 ? "s" : ""}</span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {portalName && <><span className="font-medium text-gray-300">{portalName}</span> · </>}
              {(r.objectCounts.contacts ?? 0).toLocaleString("fr-FR")} contacts ·{" "}
              {(r.objectCounts.companies ?? 0).toLocaleString("fr-FR")} companies ·{" "}
              {(r.objectCounts.deals ?? 0).toLocaleString("fr-FR")} deals
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dateStr}
              {executionDurationMs != null && ` · ${Math.round(executionDurationMs / 1000)}s`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-4 text-center">
              <div>
                <ScoreCircle score={r.score} size="md" />
                <p className="text-xs text-gray-500 mt-1">Propriétés</p>
              </div>
              {c?.hasContacts && (
                <div>
                  <ScoreCircle score={c.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Contacts</p>
                </div>
              )}
              {co?.hasCompanies && (
                <div>
                  <ScoreCircle score={co.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Companies</p>
                </div>
              )}
              {d?.hasDeals && (
                <div>
                  <ScoreCircle score={d.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Deals</p>
                </div>
              )}
              {l?.hasLeads && !l.scopeError && (
                <div>
                  <ScoreCircle score={l.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Leads</p>
                </div>
              )}
              {w?.hasWorkflows && w.score !== null && (
                <div>
                  <ScoreCircle score={w.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Workflows</p>
                </div>
              )}
              {u?.hasUsers && !u.scopeError && (
                <div>
                  <ScoreCircle score={u.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Utilisateurs</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isPublic && shareToken && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <><CircleCheck className="h-4 w-4 mr-1.5" />Lien copié</>
                  ) : (
                    <><Share2 className="h-4 w-4 mr-1.5" />Partager le rapport</>
                  )}
                </Button>
              )}
              {!isPublic && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1.5" />Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Scope banner for partial audits */}
      {isPartialAudit && (
        <div className="rounded-lg bg-gray-850 border border-gray-700 px-5 py-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-gray-300">
                Cet audit couvre {auditDomains!.selected.length} domaine{auditDomains!.selected.length !== 1 ? "s" : ""} sur {allImplemented.length} disponibles : {auditedLabels.join(", ")}.
              </p>
              {nonAuditedLabels.length > 0 && (
                <p className="text-gray-500 mt-1">
                  Domaines non inclus : {nonAuditedLabels.join(", ")}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky tabs navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sticky
      />

      {/* Executive summary */}
      {llmSummary && (
        <section id="section-resume" className="scroll-mt-16">
          <Card>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-[15px] font-semibold text-gray-100 mb-2">Résumé exécutif</h2>
                <p className="text-sm text-gray-300 leading-relaxed">{llmSummary}</p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Properties */}
      <section id="section-properties" className="scroll-mt-16 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Propriétés custom</h2>
          <ScoreCircle score={r.score} size="sm" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(["contacts", "companies", "deals"] as const).map((type) => (
            <Card key={type} padding="compact" className="text-center">
              <p className="text-2xl font-bold text-gray-100 tabular-nums">{r.customPropertyCounts[type] ?? 0}</p>
              <p className="text-xs text-gray-500 capitalize">{type}</p>
            </Card>
          ))}
        </div>

        <RuleCard title="Propriétés vides depuis plus de 90 jours" ruleKey="p1" severity="critique" isEmpty={r.p1.length === 0} count={r.p1.length} defaultOpen={r.p1.length > 0}>
          <PaginatedList
            items={r.p1}
            renderItem={(item: PropertyIssue) => (
              <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-200">{item.label}</span>
                  <span className="ml-2 text-xs text-gray-500">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({item.objectType})</span>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}
                </span>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Propriétés sous-utilisées (fill rate < 5%)" ruleKey="p2" severity="avertissement" isEmpty={r.p2.length === 0} count={r.p2.length}>
          <PaginatedList
            items={r.p2}
            renderItem={(item: PropertyIssue) => (
              <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-200">{item.label}</span>
                  <span className="ml-2 text-xs text-gray-500">{item.objectType}</span>
                </div>
                <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
                  {item.fillRate !== undefined ? `${Math.round(item.fillRate * 100)}%` : "—"}
                  {item.filledCount !== undefined && item.totalCount !== undefined ? ` (${item.filledCount}/${item.totalCount})` : ""}
                </span>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Doublons de propriétés (labels similaires)" ruleKey="p3" severity="avertissement" isEmpty={r.p3.length === 0} count={r.p3.length}>
          <PaginatedList
            items={r.p3}
            renderItem={(item: PropertyPair) => (
              <div key={`${item.a.name}-${item.b.name}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-200">{item.a.label}</span>
                  <span className="text-gray-600">↔</span>
                  <span className="font-medium text-gray-200">{item.b.label}</span>
                  <span className="text-xs text-amber-400 font-medium ml-auto">
                    {Math.round(item.similarity * 100)}% similaires
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.a.objectType}</p>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Propriétés sans description" ruleKey="p4" severity="info" isEmpty={r.p4.length === 0} count={r.p4.length}>
          <PaginatedList
            items={r.p4}
            renderItem={(item: PropertyIssue) => (
              <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                <span className="font-medium text-gray-200">{item.label}</span>
                <span className="text-xs text-gray-500">{item.objectType}</span>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Propriétés non organisées (groupe par défaut)" ruleKey="p5" severity="info" isEmpty={r.p5.length === 0} count={r.p5.length}>
          <PaginatedList
            items={r.p5}
            renderItem={(item: PropertyIssue) => (
              <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                <span className="font-medium text-gray-200">{item.label}</span>
                <span className="text-xs text-gray-500">{item.objectType}</span>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Types de données inadaptés" ruleKey="p6" severity="avertissement" isEmpty={r.p6.length === 0} count={r.p6.length}>
          <PaginatedList
            items={r.p6}
            renderItem={(item: TypingIssue) => (
              <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.label}</span>
                  <span className="text-xs text-amber-400">{item.currentType} → {item.suggestedType}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
              </div>
            )}
          />
        </RuleCard>
      </section>

      {/* Contacts (EP-05) */}
      {c?.hasContacts && (
        <section id="section-contacts" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Contacts</h2>
            <ScoreCircle score={c.score} size="sm" />
          </div>

          <Card padding="compact" className="text-center">
            <p className="text-2xl font-bold text-gray-100 tabular-nums">{c.totalContacts.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-gray-500">contacts analysés</p>
          </Card>

          {/* Bloc doublons */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Doublons</h3>

          <RuleCard title="Doublons email (exact après normalisation)" ruleKey="c06" severity="critique" isEmpty={c.c06.length === 0} count={c.c06.length} defaultOpen={c.c06.length > 0}>
            <PaginatedList
              items={c.c06}
              renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />}
            />
          </RuleCard>

          <RuleCard title="Doublons nom + company (similarité > 85%)" ruleKey="c07" severity="avertissement" isEmpty={c.c07.length === 0} count={c.c07.length}>
            <PaginatedList
              items={c.c07}
              renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={`${cluster.normalizedValue}-${cluster.members[0]?.id}`} cluster={cluster} />}
            />
          </RuleCard>

          <RuleCard title="Doublons téléphone (après normalisation)" ruleKey="c08" severity="avertissement" isEmpty={c.c08.length === 0} count={c.c08.length}>
            <PaginatedList
              items={c.c08}
              renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />}
            />
          </RuleCard>

          {/* Bloc qualité */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Qualité des données</h3>

          <RuleCard title="Emails au format invalide" ruleKey="c09" severity="avertissement" isEmpty={c.c09.length === 0} count={c.c09.length}>
            <PaginatedList
              items={c.c09}
              renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
            />
          </RuleCard>

          <RuleCard title="Contacts inactifs depuis plus d'un an" ruleKey="c10" severity="info" isEmpty={c.c10.length === 0} count={c.c10.length}>
            <PaginatedList
              items={c.c10}
              renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
            />
          </RuleCard>

          <RuleCard title="Contacts sans propriétaire assigné" ruleKey="c11" severity="info" isEmpty={c.c11.length === 0} count={c.c11.length}>
            <PaginatedList
              items={c.c11}
              renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
            />
          </RuleCard>

          <RuleCard title="Contacts sans source d'acquisition" ruleKey="c12" severity="info" isEmpty={c.c12.length === 0} count={c.c12.length}>
            <PaginatedList
              items={c.c12}
              renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
            />
          </RuleCard>

          {/* Bloc lifecycle */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Cohérence lifecycle</h3>

          <RuleCard title="Taux de contacts avec email renseigné" ruleKey="c01" severity="critique" isEmpty={!c.c01.triggered} defaultOpen={c.c01.triggered} rateResult={c.c01}>
            <span />
          </RuleCard>

          <RuleCard title="Contacts sans prénom ni nom" ruleKey="c02" severity="critique" isEmpty={c.c02.count === 0} count={c.c02.count} defaultOpen={c.c02.count > 0}>
            {c.c02.count > 0 && (
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-red-400">{c.c02.count.toLocaleString("fr-FR")}</span> contacts sans identité
                </p>
                {c.c02.examples.length > 0 && (
                  <PaginatedList
                    items={c.c02.examples}
                    renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
                  />
                )}
              </div>
            )}
          </RuleCard>

          <RuleCard title="Taux de contacts avec lifecycle stage" ruleKey="c03" severity="avertissement" isEmpty={!c.c03.triggered} rateResult={c.c03}>
            <span />
          </RuleCard>

          <RuleCard title="Deal gagné sans lifecycle customer" ruleKey="c04a" severity="avertissement" isEmpty={c.c04a.count === 0} count={c.c04a.count}>
            {c.c04a.count > 0 && (
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-amber-400">{c.c04a.count.toLocaleString("fr-FR")}</span> contacts avec lifecycle incohérent
                </p>
                {c.c04a.examples.length > 0 && (
                  <PaginatedList
                    items={c.c04a.examples}
                    renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />}
                  />
                )}
              </div>
            )}
          </RuleCard>

          <RuleCard title="Aucun MQL ni SQL avec des deals ouverts" ruleKey="c04c" severity="avertissement" isEmpty={!c.c04c.triggered} defaultOpen={c.c04c.triggered}>
            {c.c04c.triggered && (
              <p className="text-sm text-amber-400 font-medium">Votre entonnoir de qualification n&apos;est pas tracé dans HubSpot.</p>
            )}
          </RuleCard>

          <RuleCard title="Taux de contacts rattachés à une company" ruleKey="c05" severity="info" isEmpty={c.c05 === null || !c.c05.triggered} rateResult={c.c05 ?? undefined}>
            {c.c05 === null ? (
              <p className="text-sm text-gray-500 italic">Règle non applicable — aucune company détectée (contexte B2C).</p>
            ) : <span />}
          </RuleCard>
        </section>
      )}

      {/* Companies (EP-05b) */}
      {co?.hasCompanies && (
        <section id="section-companies" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Companies</h2>
            <ScoreCircle score={co.score} size="sm" />
          </div>

          <Card padding="compact" className="text-center">
            <p className="text-2xl font-bold text-gray-100 tabular-nums">{co.totalCompanies.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-gray-500">companies analysées</p>
          </Card>

          {/* Bloc doublons */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Doublons</h3>

          <RuleCard title="Doublons domain (exact après normalisation)" ruleKey="co02" severity="critique" isEmpty={co.co02.length === 0} count={co.co02.length} defaultOpen={co.co02.length > 0}>
            <PaginatedList
              items={co.co02}
              renderItem={(cluster: CompanyDuplicateCluster) => <CompanyDuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />}
            />
          </RuleCard>

          <RuleCard title="Doublons nom entreprise (similarité > 85%)" ruleKey="co03" severity="avertissement" isEmpty={co.co03.length === 0} count={co.co03.length}>
            <PaginatedList
              items={co.co03}
              renderItem={(cluster: CompanyDuplicateCluster) => <CompanyDuplicateClusterRow key={`${cluster.normalizedValue}-${cluster.members[0]?.id}`} cluster={cluster} />}
            />
          </RuleCard>

          {/* Bloc qualité */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Qualité des données</h3>

          <RuleCard title="Taux de companies avec domaine renseigné" ruleKey="co01" severity="critique" isEmpty={!co.co01.triggered} defaultOpen={co.co01.triggered} rateResult={co.co01}>
            <span />
          </RuleCard>

          <RuleCard title="Companies sans contact (> 90 jours)" ruleKey="co04" severity="avertissement" isEmpty={co.co04.length === 0} count={co.co04.length}>
            <PaginatedList
              items={co.co04}
              renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />}
            />
          </RuleCard>

          <RuleCard title="Companies sans propriétaire assigné" ruleKey="co05" severity="info" isEmpty={co.co05.length === 0} count={co.co05.length}>
            <PaginatedList
              items={co.co05}
              renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />}
            />
          </RuleCard>

          <RuleCard title="Companies sans industrie" ruleKey="co06" severity="info" isEmpty={co.co06.length === 0} count={co.co06.length}>
            <PaginatedList
              items={co.co06}
              renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />}
            />
          </RuleCard>

          <RuleCard title="Companies sans dimensionnement (effectif + CA)" ruleKey="co07" severity="info" isEmpty={co.co07.length === 0} count={co.co07.length}>
            <PaginatedList
              items={co.co07}
              renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />}
            />
          </RuleCard>

          <RuleCard title="Companies inactives depuis plus d'un an" ruleKey="co08" severity="info" isEmpty={co.co08.length === 0} count={co.co08.length}>
            <PaginatedList
              items={co.co08}
              renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />}
            />
          </RuleCard>
        </section>
      )}

      {/* Deals & Pipelines (EP-06) */}
      {d !== undefined && d !== null && d.hasDeals && (
        <section id="section-deals" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Deals &amp; Pipelines</h2>
            <ScoreCircle score={d.score} size="sm" />
          </div>

          <div className="text-sm text-gray-400 mb-2">
            {d.totalOpenDeals.toLocaleString("fr-FR")} deals ouverts · {d.totalPipelines} pipeline{d.totalPipelines !== 1 ? "s" : ""}
          </div>

          {/* D-01 : Taux montant */}
          <RuleCard title="Taux de deals avec montant renseigné" ruleKey="d01" severity="critique" isEmpty={!d.d01.triggered} defaultOpen={d.d01.triggered} rateResult={d.d01}>
            <span />
          </RuleCard>

          {/* D-02 : Taux date de clôture */}
          <RuleCard title="Taux de deals avec date de clôture" ruleKey="d02" severity="critique" isEmpty={!d.d02.triggered} defaultOpen={d.d02.triggered} rateResult={d.d02}>
            <span />
          </RuleCard>

          {/* D-03 : Deals anciens */}
          <RuleCard title="Deals ouverts depuis plus de 60 jours" ruleKey="d03" severity="avertissement" isEmpty={d.d03.length === 0} count={d.d03.length} defaultOpen={d.d03.length > 0}>
            <PaginatedList
              items={d.d03}
              renderItem={(item: DealDetailIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span>
                  </div>
                  <span className="text-xs text-red-400 font-medium">{item.ageInDays}j</span>
                </div>
              )}
            />
          </RuleCard>

          {/* D-04 : Propriétés obligatoires manquantes */}
          <RuleCard title="Propriétés obligatoires non renseignées" ruleKey="d04" severity="critique" isEmpty={d.d04.reduce((s, g) => s + g.deals.length, 0) === 0} count={d.d04.reduce((s, g) => s + g.deals.length, 0)}>
            <PaginatedList
              items={d.d04}
              renderItem={(item: PipelineStageIssue) => (
                <div key={`${item.pipeline}-${item.stage}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipeline} → {item.stage}</span>
                    <span className="text-xs text-amber-400">{item.deals.length} deal{item.deals.length !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Propriétés manquantes : {item.missingProperties.join(", ")}
                  </p>
                </div>
              )}
            />
          </RuleCard>

          {/* D-05 : Deals bloqués */}
          <RuleCard title="Deals bloqués dans un stage (> 60 jours)" ruleKey="d05" severity="avertissement" isEmpty={d.d05.reduce((s, g) => s + g.deals.length, 0) === 0} count={d.d05.reduce((s, g) => s + g.deals.length, 0)} defaultOpen={d.d05.length > 0}>
            <PaginatedList
              items={d.d05}
              renderItem={(group: BlockedDealGroup) => (
                <div key={`${group.pipelineId}-${group.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-200">{group.pipelineLabel} → {group.stageLabel}</span>
                    <span className="text-xs text-amber-400">{group.deals.length} deal{group.deals.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-1">
                    {group.deals.slice(0, 5).map((deal) => (
                      <div key={deal.id} className="text-xs text-gray-400 flex justify-between">
                        <span>{deal.name}</span>
                        <span className="text-red-400">{deal.daysInStage}j dans ce stage</span>
                      </div>
                    ))}
                    {group.deals.length > 5 && (
                      <p className="text-xs text-gray-500">+ {group.deals.length - 5} autres</p>
                    )}
                  </div>
                </div>
              )}
            />
          </RuleCard>

          {/* D-08 : Sans owner */}
          <RuleCard title="Deals sans propriétaire assigné" ruleKey="d08" severity="info" isEmpty={d.d08.length === 0} count={d.d08.length}>
            <PaginatedList
              items={d.d08}
              renderItem={(item: DealDetailIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* D-09 : Sans contact */}
          <RuleCard title="Deals sans contact associé" ruleKey="d09" severity="avertissement" isEmpty={d.d09.length === 0} count={d.d09.length}>
            <PaginatedList
              items={d.d09}
              renderItem={(item: DealDetailIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* D-10 : Sans company */}
          {!d.d10.disabled && (
            <RuleCard title="Deals sans company associée" ruleKey="d10" severity="info" isEmpty={d.d10.deals.length === 0} count={d.d10.deals.length}>
              <PaginatedList
                items={d.d10.deals}
                renderItem={(item: DealDetailIssue) => (
                  <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                  </div>
                )}
              />
            </RuleCard>
          )}

          {/* D-11 : Montant à 0 */}
          <RuleCard title="Deals avec montant à 0" ruleKey="d11" severity="avertissement" isEmpty={d.d11.length === 0} count={d.d11.length}>
            <PaginatedList
              items={d.d11}
              renderItem={(item: DealDetailIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* Pipeline rules section */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Configuration des pipelines</h3>

          {/* D-06 : Pipeline sans activité */}
          <RuleCard title="Pipelines sans activité récente" ruleKey="d06" severity="info" isEmpty={d.d06.length === 0} count={d.d06.length}>
            <PaginatedList
              items={d.d06}
              renderItem={(item: PipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  <span className="text-xs text-gray-500">{item.stageCount} stages</span>
                </div>
              )}
            />
          </RuleCard>

          {/* D-07 : Trop de stages */}
          <RuleCard title="Pipelines avec trop de stages (> 8)" ruleKey="d07" severity="info" isEmpty={d.d07.length === 0} count={d.d07.length}>
            <PaginatedList
              items={d.d07}
              renderItem={(item: PipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  <span className="text-xs text-amber-400">{item.activeStageCount} stages actifs</span>
                </div>
              )}
            />
          </RuleCard>

          {/* D-12 : Phases sautées */}
          <RuleCard title="Pipelines avec phases fréquemment sautées" ruleKey="d12" severity="avertissement" isEmpty={d.d12.length === 0} count={d.d12.length}>
            <PaginatedList
              items={d.d12}
              renderItem={(item: PipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="text-xs text-amber-400">{Math.round((item.skippedRate ?? 0) * 100)}% des deals</span>
                  </div>
                  {item.topSkippedStages && item.topSkippedStages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stages les plus sautés : {item.topSkippedStages.map((s) => s.stageLabel).join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          </RuleCard>

          {/* D-13 : Points d'entrée multiples */}
          <RuleCard title="Pipelines avec points d'entrée multiples" ruleKey="d13" severity="avertissement" isEmpty={d.d13.length === 0} count={d.d13.length}>
            <PaginatedList
              items={d.d13}
              renderItem={(item: PipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="text-xs text-amber-400">{Math.round((item.nonStandardEntryRate ?? 0) * 100)}% hors 1ère étape</span>
                  </div>
                </div>
              )}
            />
          </RuleCard>

          {/* D-14 : Stages fermés redondants */}
          <RuleCard title="Pipelines avec stages fermés redondants" ruleKey="d14" severity="avertissement" isEmpty={d.d14.length === 0} count={d.d14.length}>
            <PaginatedList
              items={d.d14}
              renderItem={(item: PipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  </div>
                  {item.closedWonStages && item.closedWonStages.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Gagné : {item.closedWonStages.map((s) => s.label).join(", ")}
                    </p>
                  )}
                  {item.closedLostStages && item.closedLostStages.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Perdu : {item.closedLostStages.map((s) => s.label).join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          </RuleCard>

          {/* D-15 : Stages sans activité */}
          <RuleCard title="Stages sans activité depuis 90 jours" ruleKey="d15" severity="info" isEmpty={d.d15.length === 0} count={d.d15.length}>
            <PaginatedList
              items={d.d15}
              renderItem={(item: StageRuleResult) => (
                <div key={`${item.pipelineId}-${item.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="mx-1 text-gray-600">→</span>
                    <span className="text-gray-300">{item.stageLabel}</span>
                  </div>
                  {item.lastActivity && (
                    <span className="text-xs text-gray-500">
                      Dernière activité : {new Date(item.lastActivity).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              )}
            />
          </RuleCard>
        </section>
      )}

      {/* Leads & Prospection (EP-18) */}
      {l !== undefined && l !== null && l.hasLeads && !l.scopeError && (
        <section id="section-leads" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Leads &amp; Prospection</h2>
            <ScoreCircle score={l.score} size="sm" />
          </div>

          <div className="text-sm text-gray-400 mb-2">
            {l.totalLeads.toLocaleString("fr-FR")} leads · {l.totalPipelines} pipeline{l.totalPipelines !== 1 ? "s" : ""} de prospection
          </div>

          {/* Qualité données leads */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Qualité des données leads</h3>

          {/* L-01 : Leads anciens */}
          <RuleCard title="Leads ouverts depuis plus de 30 jours" ruleKey="l01" severity="avertissement" isEmpty={l.l01.length === 0} count={l.l01.length} defaultOpen={l.l01.length > 0}>
            <PaginatedList
              items={l.l01}
              renderItem={(item: LeadIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span>
                  </div>
                  <span className="text-xs text-red-400 font-medium">{item.ageInDays}j</span>
                </div>
              )}
            />
          </RuleCard>

          {/* L-03 : Sans owner */}
          <RuleCard title="Leads sans propriétaire assigné" ruleKey="l03" severity="info" isEmpty={l.l03.length === 0} count={l.l03.length}>
            <PaginatedList
              items={l.l03}
              renderItem={(item: LeadIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* L-04 : Sans contact — Critique */}
          <RuleCard title="Leads sans contact associé" ruleKey="l04" severity="critique" isEmpty={l.l04.length === 0} count={l.l04.length} defaultOpen={l.l04.length > 0}>
            <PaginatedList
              items={l.l04}
              renderItem={(item: LeadIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* L-14 : Sans source */}
          <RuleCard title="Leads sans source d'origine" ruleKey="l14" severity="avertissement" isEmpty={l.l14.length === 0} count={l.l14.length}>
            <PaginatedList
              items={l.l14}
              renderItem={(item: LeadIssue) => (
                <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                </div>
              )}
            />
          </RuleCard>

          {/* Leads bloqués */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Leads bloqués</h3>

          {/* L-02 : Leads bloqués dans un stage */}
          <RuleCard title="Leads bloqués dans un stage (> 30 jours)" ruleKey="l02" severity="avertissement" isEmpty={l.l02.reduce((s, g) => s + g.leads.length, 0) === 0} count={l.l02.reduce((s, g) => s + g.leads.length, 0)} defaultOpen={l.l02.length > 0}>
            <PaginatedList
              items={l.l02}
              renderItem={(group: LeadBlockedGroup) => (
                <div key={`${group.pipelineId}-${group.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-200">{group.pipelineLabel} → {group.stageLabel}</span>
                    <span className="text-xs text-amber-400">{group.leads.length} lead{group.leads.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-1">
                    {group.leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="text-xs text-gray-400 flex justify-between">
                        <span>{lead.name}</span>
                        <span className="text-red-400">{lead.daysInStage}j dans ce stage</span>
                      </div>
                    ))}
                    {group.leads.length > 5 && (
                      <p className="text-xs text-gray-500">+ {group.leads.length - 5} autres</p>
                    )}
                  </div>
                </div>
              )}
            />
          </RuleCard>

          {/* Processus de disqualification */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Processus de disqualification</h3>

          {/* L-11 : Disqualifié sans motif */}
          <RuleCard title="Leads disqualifiés sans motif" ruleKey="l11" severity="avertissement" isEmpty={!l.l11.triggered} count={l.l11.withoutReason} defaultOpen={l.l11.triggered}>
            <div>
              {l.l11.triggered && (
                <p className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-amber-400">{l.l11.withoutReason}</span> leads sans motif
                  sur <span className="font-medium text-gray-200">{l.l11.totalDisqualified}</span> disqualifiés
                  ({Math.round(l.l11.rate * 100)}%)
                </p>
              )}
              <PaginatedList
                items={l.l11.leads}
                renderItem={(item: LeadIssue) => (
                  <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.pipelineLabel}</span>
                  </div>
                )}
              />
            </div>
          </RuleCard>

          {/* L-12 : Motif non structuré */}
          {!l.l12.disabled && (
            <RuleCard title="Motif de disqualification non structuré" ruleKey="l12" severity="info" isEmpty={!l.l12.triggered} count={l.l12.triggered ? 1 : 0}>
              <div>
                {l.l12.triggered && l.l12.propertyName && (
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">
                      La propriété <span className="font-mono text-amber-400">{l.l12.propertyName}</span> est de type <span className="font-mono text-amber-400">{l.l12.propertyType}</span>.
                    </p>
                    <p className="text-xs text-gray-400">
                      Recommandation : convertir en type <span className="font-medium text-gray-200">enumeration</span> avec des valeurs prédéfinies
                      (ex. : Budget insuffisant, Pas le bon timing, Concurrent retenu, Pas de besoin identifié, Mauvais contact, Autre).
                    </p>
                  </div>
                )}
              </div>
            </RuleCard>
          )}
          {l.l12.disabled && l.l12.disabledReason && (
            <div className="rounded-lg bg-gray-850 border border-gray-700 px-4 py-3 text-sm text-gray-400">
              L-11 / L-12 : {l.l12.disabledReason}
            </div>
          )}

          {/* Handoff lead → deal */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Handoff lead → deal</h3>

          {/* L-13 : Qualifié sans deal — Critique */}
          <RuleCard title="Leads qualifiés sans deal associé" ruleKey="l13" severity="critique" isEmpty={!l.l13.triggered} count={l.l13.withoutDeal} defaultOpen={l.l13.triggered}>
            <div>
              {l.l13.triggered && (
                <p className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold text-red-400">{l.l13.withoutDeal}</span> leads sans deal
                  sur <span className="font-medium text-gray-200">{l.l13.totalQualified}</span> qualifiés
                  ({Math.round(l.l13.rate * 100)}%)
                </p>
              )}
              <PaginatedList
                items={l.l13.leads}
                renderItem={(item: LeadIssue) => (
                  <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-200">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
                  </div>
                )}
              />
            </div>
          </RuleCard>

          {/* Santé des pipelines de prospection */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Santé des pipelines de prospection</h3>

          {/* L-05 : Pipeline sans activité */}
          <RuleCard title="Pipelines de prospection sans activité récente" ruleKey="l05" severity="info" isEmpty={l.l05.length === 0} count={l.l05.length}>
            <PaginatedList
              items={l.l05}
              renderItem={(item: LeadPipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  <span className="text-xs text-gray-500">{item.stageCount} stages</span>
                </div>
              )}
            />
          </RuleCard>

          {/* L-06 : Trop de stages */}
          <RuleCard title="Pipelines de prospection avec trop de stages (> 5)" ruleKey="l06" severity="info" isEmpty={l.l06.length === 0} count={l.l06.length}>
            <PaginatedList
              items={l.l06}
              renderItem={(item: LeadPipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  <span className="text-xs text-amber-400">{item.activeStageCount} stages actifs</span>
                </div>
              )}
            />
          </RuleCard>

          {/* L-07 : Phases sautées */}
          <RuleCard title="Pipelines avec phases fréquemment sautées" ruleKey="l07" severity="avertissement" isEmpty={l.l07.length === 0} count={l.l07.length}>
            <PaginatedList
              items={l.l07}
              renderItem={(item: LeadPipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="text-xs text-amber-400">{Math.round((item.skippedRate ?? 0) * 100)}% des leads</span>
                  </div>
                  {item.topSkippedStages && item.topSkippedStages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Stages les plus sautés : {item.topSkippedStages.map((s) => s.stageLabel).join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          </RuleCard>

          {/* L-08 : Points d'entrée multiples */}
          <RuleCard title="Pipelines avec points d'entrée multiples" ruleKey="l08" severity="avertissement" isEmpty={l.l08.length === 0} count={l.l08.length}>
            <PaginatedList
              items={l.l08}
              renderItem={(item: LeadPipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="text-xs text-amber-400">{Math.round((item.nonStandardEntryRate ?? 0) * 100)}% hors 1ère étape</span>
                  </div>
                </div>
              )}
            />
          </RuleCard>

          {/* L-09 : Stages fermés redondants */}
          <RuleCard title="Pipelines avec stages fermés redondants" ruleKey="l09" severity="avertissement" isEmpty={l.l09.length === 0} count={l.l09.length}>
            <PaginatedList
              items={l.l09}
              renderItem={(item: LeadPipelineRuleResult) => (
                <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                  </div>
                  {item.qualifiedStages && item.qualifiedStages.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Qualified : {item.qualifiedStages.map((s) => s.label).join(", ")}
                    </p>
                  )}
                  {item.disqualifiedStages && item.disqualifiedStages.length > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Disqualified : {item.disqualifiedStages.map((s) => s.label).join(", ")}
                    </p>
                  )}
                </div>
              )}
            />
          </RuleCard>

          {/* L-10 : Stages sans activité */}
          <RuleCard title="Stages sans activité depuis 60 jours" ruleKey="l10" severity="info" isEmpty={l.l10.length === 0} count={l.l10.length}>
            <PaginatedList
              items={l.l10}
              renderItem={(item: LeadStageRuleResult) => (
                <div key={`${item.pipelineId}-${item.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-200">{item.pipelineLabel}</span>
                    <span className="mx-1 text-gray-600">→</span>
                    <span className="text-gray-300">{item.stageLabel}</span>
                  </div>
                  {item.lastActivity && (
                    <span className="text-xs text-gray-500">
                      Dernière activité : {new Date(item.lastActivity).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              )}
            />
          </RuleCard>
        </section>
      )}

      {/* Workflows */}
      {w !== undefined && w !== null && w.hasWorkflows && (
        <section id="section-workflows" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Workflows</h2>
            {w.score !== null && (
              <ScoreCircle score={w.score} size="sm" />
            )}
          </div>

          {w.notAnalyzed.length > 0 && (
            <div className="rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] px-4 py-3 text-sm text-amber-300">
              {w.notAnalyzed.length} workflow{w.notAnalyzed.length > 1 ? "s" : ""} n&apos;ont pas pu être analysés.
            </div>
          )}

          <RuleCard title="Workflows actifs avec taux d'erreur > 10%" ruleKey="w1" severity="critique" isEmpty={w.w1.length === 0} count={w.w1.length} defaultOpen={w.w1.length > 0}>
            <PaginatedList items={w.w1} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows actifs sans actions configurées" ruleKey="w2" severity="critique" isEmpty={w.w2.length === 0} count={w.w2.length} defaultOpen={w.w2.length > 0}>
            <PaginatedList items={w.w2} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows actifs sans enrôlement récent (> 90j)" ruleKey="w3" severity="avertissement" isEmpty={w.w3.length === 0} count={w.w3.length}>
            <PaginatedList items={w.w3} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows inactifs depuis plus de 90 jours" ruleKey="w4" severity="avertissement" isEmpty={w.w4.length === 0} count={w.w4.length}>
            <PaginatedList items={w.w4} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows récemment désactivés" ruleKey="w5" severity="info" isEmpty={w.w5.length === 0} count={w.w5.length}>
            <PaginatedList items={w.w5} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows avec noms non descriptifs" ruleKey="w6" severity="info" isEmpty={w.w6.length === 0} count={w.w6.length}>
            <PaginatedList items={w.w6} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>

          <RuleCard title="Workflows sans dossier" ruleKey="w7" severity="info" isEmpty={w.w7.length === 0} count={w.w7.length}>
            <PaginatedList items={w.w7} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
          </RuleCard>
        </section>
      )}

      {/* Users & Teams (EP-09) */}
      {u?.hasUsers && (
        <section id="section-users" className="scroll-mt-16 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Utilisateurs & Équipes</h2>
            {!u.scopeError && <ScoreCircle score={u.score} size="sm" />}
          </div>

          {/* Scope error alert */}
          {u.scopeError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-400">{u.scopeError}</p>
                  <p className="text-xs text-red-400/70 mt-1">
                    Rendez-vous dans Dashboard → Connexions HubSpot pour re-autoriser l&apos;application.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!u.scopeError && (
            <>
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card padding="compact" className="text-center">
                  <p className="text-2xl font-bold text-gray-100 tabular-nums">{u.totalUsers}</p>
                  <p className="text-xs text-gray-500">utilisateurs</p>
                </Card>
                <Card padding="compact" className="text-center">
                  <p className="text-2xl font-bold text-gray-100 tabular-nums">{u.totalTeams}</p>
                  <p className="text-xs text-gray-500">équipes</p>
                </Card>
                <Card padding="compact" className="text-center">
                  <p className="text-2xl font-bold text-gray-100 tabular-nums">{u.totalRoles}</p>
                  <p className="text-xs text-gray-500">rôles distincts</p>
                </Card>
              </div>

              {/* Bloc Sécurité */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Sécurité</h3>

              <RuleCard
                title="Super Admins en excès"
                ruleKey="u02"
                severity="critique"
                isEmpty={!u.u02.triggered}
                count={u.u02.triggered ? 1 : 0}
                defaultOpen={u.u02.triggered}
              >
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="font-semibold text-red-400">{u.u02.superAdminCount}</span> Super Admins
                    sur <span className="font-medium text-gray-200">{u.u02.totalUsers}</span> utilisateurs
                    ({Math.round(u.u02.rate * 100)}%)
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Seuil recommandé pour ce workspace : {u.u02.threshold}
                  </p>
                  {u.u02.superAdmins.length > 0 && (
                    <PaginatedList
                      items={u.u02.superAdmins}
                      renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />}
                    />
                  )}
                </div>
              </RuleCard>

              <RuleCard
                title="Utilisateurs potentiellement inactifs"
                ruleKey="u05"
                severity="critique"
                isEmpty={u.u05.inactiveUsers.length === 0}
                count={u.u05.inactiveUsers.length}
                defaultOpen={u.u05.inactiveUsers.length > 0}
              >
                <div>
                  {!u.u05.isEnterprise && (
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/15 px-3 py-2 mb-3">
                      <p className="text-xs text-amber-300/80">
                        L&apos;historique de connexion n&apos;est disponible que sur les comptes HubSpot Enterprise.
                        Cette détection se base sur l&apos;absence d&apos;objets CRM assignés — certains utilisateurs
                        (ex: management, consultation seule) peuvent être actifs sans posséder d&apos;objets.
                      </p>
                    </div>
                  )}
                  <PaginatedList
                    items={u.u05.inactiveUsers}
                    renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />}
                  />
                </div>
              </RuleCard>

              {/* Bloc Gouvernance */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Gouvernance</h3>

              <RuleCard
                title="Utilisateurs sans rôle assigné"
                ruleKey="u03"
                severity="avertissement"
                isEmpty={u.u03.length === 0}
                count={u.u03.length}
              >
                <PaginatedList
                  items={u.u03}
                  renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />}
                />
              </RuleCard>

              <RuleCard
                title="Absence de différenciation des rôles"
                ruleKey="u04"
                severity="avertissement"
                isEmpty={!u.u04.triggered}
                count={u.u04.triggered ? 1 : 0}
              >
                {u.u04.disabled ? (
                  <p className="text-sm text-gray-500 italic">{u.u04.disabledReason}</p>
                ) : (
                  <div>
                    {u.u04.triggered && (
                      <p className="text-sm text-amber-400 font-medium mb-3">
                        {Math.round(u.u04.dominantRate * 100)}% de vos utilisateurs partagent le même rôle.
                      </p>
                    )}
                    {u.u04.distribution.length > 0 && (
                      <div className="rounded-md border border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide">
                              <th className="text-left px-3 py-2 font-medium">Rôle</th>
                              <th className="text-right px-3 py-2 font-medium">Utilisateurs</th>
                              <th className="text-right px-3 py-2 font-medium">%</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {u.u04.distribution.map((d: RoleDistribution, i: number) => (
                              <tr key={d.roleId ?? "__null__"} className={i === 0 && u.u04.triggered ? "bg-amber-500/5" : ""}>
                                <td className="px-3 py-2 text-gray-200 font-medium">
                                  {d.roleName}
                                  {i === 0 && u.u04.triggered && (
                                    <Badge variant="critique" className="ml-2">Dominant</Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right text-gray-300 tabular-nums">{d.count}</td>
                                <td className="px-3 py-2 text-right text-gray-400 tabular-nums">{Math.round(d.percentage * 100)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </RuleCard>

              {/* Bloc Équipes */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Équipes</h3>

              <RuleCard
                title="Utilisateurs sans équipe"
                ruleKey="u01"
                severity="avertissement"
                isEmpty={u.u01.length === 0}
                count={u.u01.length}
              >
                <PaginatedList
                  items={u.u01}
                  renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />}
                />
              </RuleCard>

              <RuleCard
                title="Équipes vides"
                ruleKey="u06"
                severity="info"
                isEmpty={u.u06.length === 0}
                count={u.u06.length}
              >
                <PaginatedList
                  items={u.u06}
                  renderItem={(item: TeamIssue) => (
                    <div key={item.teamId} className="flex items-center justify-between rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
                      <span className="font-medium text-gray-200">{item.name}</span>
                      <span className="text-xs text-gray-500">ID: {item.teamId}</span>
                    </div>
                  )}
                />
              </RuleCard>

              {/* Bloc Activité */}
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide pt-2">Activité</h3>

              <RuleCard
                title="Owners sans objet CRM assigné"
                ruleKey="u07"
                severity="info"
                isEmpty={u.u07.length === 0}
                count={u.u07.length}
              >
                <PaginatedList
                  items={u.u07}
                  renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />}
                />
              </RuleCard>

              {/* Recommandations complémentaires (non scorées) */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Recommandations — vérifications manuelles
                </h3>

                <RecommendationCard
                  title="Vérifiez les permissions critiques de vos utilisateurs"
                  id="R1"
                >
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    L&apos;API HubSpot ne permet pas d&apos;auditer les permissions détaillées par rôle.
                    Nous vous recommandons de vérifier manuellement dans <strong className="text-gray-200">Settings → Users &amp; Teams → Roles</strong> que les droits suivants sont restreints au strict nécessaire :
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 mb-3">
                    <li><strong className="text-gray-300">Export de données</strong> : seuls les managers et admins devraient pouvoir exporter des contacts, deals ou companies</li>
                    <li><strong className="text-gray-300">Import de données</strong> : limiter aux utilisateurs formés pour éviter les doublons et les erreurs de mapping</li>
                    <li><strong className="text-gray-300">Suppression en masse (bulk delete)</strong> : restreindre aux admins uniquement — une suppression accidentelle peut être irréversible</li>
                    <li><strong className="text-gray-300">Modification des propriétés et pipelines</strong> : limiter aux RevOps / admins pour éviter les dérives de configuration</li>
                  </ul>
                  <p className="text-xs text-gray-500">
                    <strong className="text-gray-400">Bonne pratique :</strong> créez un rôle par profil métier (Commercial, Marketing, Support, Admin) avec les permissions minimales nécessaires.
                  </p>
                </RecommendationCard>

                <RecommendationCard
                  title="Vérifiez l'utilisation de vos licences HubSpot"
                  id="R2"
                >
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    Le nombre de sièges achetés vs attribués n&apos;est pas accessible via l&apos;API HubSpot.
                    Nous vous recommandons de vérifier dans <strong className="text-gray-200">Settings → Account &amp; Billing → Seats</strong> :
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 mb-3">
                    <li>Le nombre de sièges <strong className="text-gray-300">Core Seat</strong> achetés vs attribués</li>
                    <li>Le nombre de sièges <strong className="text-gray-300">Sales Hub</strong> achetés vs attribués</li>
                    <li>Le nombre de sièges <strong className="text-gray-300">Service Hub</strong> achetés vs attribués</li>
                  </ul>
                  <p className="text-xs text-gray-500">
                    Si des sièges sont attribués à des utilisateurs identifiés comme inactifs (règle U-05) ou sans activité CRM (règle U-07), envisagez de les révoquer pour réduire votre facture.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    <strong className="text-gray-400">Estimation :</strong> chaque siège Sales Hub inutilisé représente 90-150 €/mois selon votre plan.
                  </p>
                </RecommendationCard>
              </div>
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-700">
        <p className="text-xs text-gray-500 mb-3">Généré par HubSpot Auditor</p>
        {!isPublic && (
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Relancer un audit</Button>
          </Link>
        )}
        {isPublic && (
          <Link href="/register">
            <Button size="sm">Créer mon compte gratuitement</Button>
          </Link>
        )}
      </footer>
    </div>
  );
}
