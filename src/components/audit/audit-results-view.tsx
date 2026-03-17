"use client";

import { useState, useMemo, useEffect } from "react";
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
import { ScoreCircle, getScoreBg, getScoreLabel } from "@/components/ui/score-circle";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ChevronDown, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { ReportLayout } from "@/components/report/report-layout";
import { MobileSidebarToggle } from "@/components/report/report-sidebar";
import { useReportSidebar } from "@/components/layout/report-sidebar-context";
import { DomainScoreGrid } from "@/components/report/domain-score-grid";
import { QuickWinsCallout } from "@/components/report/quick-wins-callout";
import { SeveritySection } from "@/components/report/severity-section";
import { RuleListItem } from "@/components/report/rule-list-item";
import { flattenAllRules, type FlatRule } from "@/lib/report/transform-rules";
import { groupBySeverity } from "@/lib/report/group-by-severity";
import { generateQuickWins } from "@/lib/report/generate-quick-wins";

// ─── Item Row Helpers ────────────────────────────────────────────────────

function WorkflowIssueRow({ wf }: { wf: WorkflowIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-200">{wf.name}</span>
        {wf.isLegacy && <Badge variant="neutre" className="ml-2">Ancien format</Badge>}
        {wf.notAnalyzed && <Badge variant="critique" className="ml-2">Non analysé</Badge>}
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
        {contact.email && <span className="ml-2 text-xs text-gray-500">{contact.email}</span>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        {contact.lifecycleStage && <Badge variant="neutre">{contact.lifecycleStage}</Badge>}
        <span>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    </div>
  );
}

function DuplicateClusterRow({ cluster }: { cluster: DuplicateCluster }) {
  const [expanded, setExpanded] = useState(false);
  const criterionLabels: Record<string, string> = { email: "Email", name_company: "Nom + Company", phone: "Téléphone" };

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800/50 text-sm">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left">
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
        {company.domain && <span className="ml-2 text-xs text-gray-500">{company.domain}</span>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-500">
        {company.industry && <Badge variant="neutre">{company.industry}</Badge>}
        {company.contactCount > 0 && <span>{company.contactCount} contact{company.contactCount !== 1 ? "s" : ""}</span>}
        <span>{company.createdAt ? new Date(company.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    </div>
  );
}

function CompanyDuplicateClusterRow({ cluster }: { cluster: CompanyDuplicateCluster }) {
  const [expanded, setExpanded] = useState(false);
  const criterionLabels: Record<string, string> = { domain: "Domain", name: "Nom" };

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800/50 text-sm">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left">
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

function ImpactBlock({ ruleKey }: { ruleKey: string }) {
  const impact = BUSINESS_IMPACTS[ruleKey];
  if (!impact) return null;
  return (
    <div className="mt-3 rounded-md bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] p-3">
      <p className="text-xs font-semibold text-amber-300 mb-1">Impact business</p>
      <p className="text-xs text-amber-200/80">{impact.estimation}</p>
    </div>
  );
}

function RateBlock({ rateResult }: { rateResult: RateResult }) {
  return (
    <div className="mb-3">
      <ProgressBar
        value={Math.round(rateResult.rate * 100)}
        threshold={Math.round(rateResult.threshold * 100)}
        className="mb-2"
      />
      <p className="text-xs text-gray-400">
        {rateResult.filledCount.toLocaleString("fr-FR")} / {rateResult.totalCount.toLocaleString("fr-FR")} — seuil : {Math.round(rateResult.threshold * 100)}%
      </p>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────

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
  scoreDelta?: number | null;
}

// ─── Component ───────────────────────────────────────────────────────────

export function AuditResultsView({
  r, w, c, co, u, d, l, globalScore, globalScoreLabel, llmSummary,
  shareToken, isPublic, portalName, startedAt, executionDurationMs, auditDomains, scoreDelta,
}: AuditResultsViewProps) {
  const displayScore = globalScore ?? r.score;
  const displayLabel = globalScoreLabel ?? r.scoreLabel;

  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const isDomainAudited = (domainId: string) => !auditDomains || auditDomains.selected.includes(domainId as never);

  const dateStr = new Date(startedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // ─── Build domain list for sidebar + grid ─────────────────────────────

  const domainsList = useMemo(() => {
    const list: { id: string; label: string; score: number | null; skipped: boolean }[] = [];

    list.push({ id: "properties", label: "Propriétés custom", score: r.score, skipped: false });

    if (isDomainAudited("contacts") && c?.hasContacts) {
      list.push({ id: "contacts", label: "Contacts", score: c.score, skipped: false });
    } else if (isDomainAudited("contacts")) {
      list.push({ id: "contacts", label: "Contacts", score: null, skipped: true });
    }

    if (isDomainAudited("companies") && co?.hasCompanies) {
      list.push({ id: "companies", label: "Companies", score: co.score, skipped: false });
    } else if (isDomainAudited("companies")) {
      list.push({ id: "companies", label: "Companies", score: null, skipped: true });
    }

    if (isDomainAudited("deals") && d?.hasDeals) {
      list.push({ id: "deals", label: "Deals & Pipelines", score: d.score, skipped: false });
    } else if (isDomainAudited("deals")) {
      list.push({ id: "deals", label: "Deals & Pipelines", score: null, skipped: true });
    }

    if (isDomainAudited("leads")) {
      if (l?.hasLeads && !l.scopeError) {
        list.push({ id: "leads", label: "Leads & Prospection", score: l.score, skipped: false });
      } else {
        list.push({ id: "leads", label: "Leads & Prospection", score: null, skipped: true });
      }
    }

    if (isDomainAudited("workflows") && w?.hasWorkflows && w.score !== null) {
      list.push({ id: "workflows", label: "Workflows", score: w.score, skipped: false });
    } else if (isDomainAudited("workflows")) {
      list.push({ id: "workflows", label: "Workflows", score: null, skipped: true });
    }

    if (isDomainAudited("users") && u?.hasUsers && !u.scopeError) {
      list.push({ id: "users", label: "Utilisateurs & Équipes", score: u.score, skipped: false });
    } else if (isDomainAudited("users")) {
      list.push({ id: "users", label: "Utilisateurs & Équipes", score: null, skipped: true });
    }

    return list;
  }, [r, c, co, d, l, w, u, auditDomains]);

  // ─── renderDetail: returns expand content for each ruleKey ────────────

  function renderDetail(ruleKey: string): (() => React.ReactNode) | undefined {
    const detail = getRuleDetail(ruleKey);
    if (!detail) return undefined;
    return () => (
      <>
        {detail}
        <ImpactBlock ruleKey={ruleKey} />
      </>
    );
  }

  function getRuleDetail(ruleKey: string): React.ReactNode | null {
    // ── Properties
    if (ruleKey === "p1") return <PaginatedList items={r.p1} renderItem={(item: PropertyIssue) => (
      <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div><span className="font-medium text-gray-200">{item.label}</span><span className="ml-2 text-xs text-gray-500">{item.name}</span><span className="ml-2 text-xs text-gray-500">({item.objectType})</span></div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    )} />;

    if (ruleKey === "p2") return <PaginatedList items={r.p2} renderItem={(item: PropertyIssue) => (
      <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div><span className="font-medium text-gray-200">{item.label}</span><span className="ml-2 text-xs text-gray-500">{item.objectType}</span></div>
        <span className="text-xs font-medium text-amber-400 whitespace-nowrap">
          {item.fillRate !== undefined ? `${Math.round(item.fillRate * 100)}%` : "—"}
          {item.filledCount !== undefined && item.totalCount !== undefined ? ` (${item.filledCount}/${item.totalCount})` : ""}
        </span>
      </div>
    )} />;

    if (ruleKey === "p3") return <PaginatedList items={r.p3} renderItem={(item: PropertyPair) => (
      <div key={`${item.a.name}-${item.b.name}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-200">{item.a.label}</span>
          <span className="text-gray-600">↔</span>
          <span className="font-medium text-gray-200">{item.b.label}</span>
          <span className="text-xs text-amber-400 font-medium ml-auto">{Math.round(item.similarity * 100)}% similaires</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{item.a.objectType}</p>
      </div>
    )} />;

    if (ruleKey === "p4") return <PaginatedList items={r.p4} renderItem={(item: PropertyIssue) => (
      <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <span className="font-medium text-gray-200">{item.label}</span>
        <span className="text-xs text-gray-500">{item.objectType}</span>
      </div>
    )} />;

    if (ruleKey === "p5") return <PaginatedList items={r.p5} renderItem={(item: PropertyIssue) => (
      <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <span className="font-medium text-gray-200">{item.label}</span>
        <span className="text-xs text-gray-500">{item.objectType}</span>
      </div>
    )} />;

    if (ruleKey === "p6") return <PaginatedList items={r.p6} renderItem={(item: TypingIssue) => (
      <div key={item.name} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-200">{item.label}</span>
          <span className="text-xs text-amber-400">{item.currentType} → {item.suggestedType}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
      </div>
    )} />;

    // ── Contacts
    if (ruleKey === "c01" && c) return <RateBlock rateResult={c.c01} />;
    if (ruleKey === "c02" && c && c.c02.count > 0) return (
      <div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-red-400">{c.c02.count.toLocaleString("fr-FR")}</span> contacts sans identité</p>
        {c.c02.examples.length > 0 && <PaginatedList items={c.c02.examples} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />}
      </div>
    );
    if (ruleKey === "c03" && c) return <RateBlock rateResult={c.c03} />;
    if (ruleKey === "c04a" && c && c.c04a.count > 0) return (
      <div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-amber-400">{c.c04a.count.toLocaleString("fr-FR")}</span> contacts avec lifecycle incohérent</p>
        {c.c04a.examples.length > 0 && <PaginatedList items={c.c04a.examples} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />}
      </div>
    );
    if (ruleKey === "c04b" && c && c.c04b.count > 0) return (
      <PaginatedList items={c.c04b.examples} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />
    );
    if (ruleKey === "c04c" && c && c.c04c.triggered) return (
      <p className="text-sm text-amber-400 font-medium">Votre entonnoir de qualification n&apos;est pas tracé dans HubSpot.</p>
    );
    if (ruleKey === "c04d" && c && c.c04d.count > 0) return (
      <PaginatedList items={c.c04d.examples} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />
    );
    if (ruleKey === "c05" && c) {
      if (c.c05 === null) return <p className="text-sm text-gray-500 italic">Règle non applicable — aucune company détectée (contexte B2C).</p>;
      return <RateBlock rateResult={c.c05} />;
    }
    if (ruleKey === "c06" && c) return <PaginatedList items={c.c06} renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />} />;
    if (ruleKey === "c07" && c) return <PaginatedList items={c.c07} renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={`${cluster.normalizedValue}-${cluster.members[0]?.id}`} cluster={cluster} />} />;
    if (ruleKey === "c08" && c) return <PaginatedList items={c.c08} renderItem={(cluster: DuplicateCluster) => <DuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />} />;
    if (ruleKey === "c09" && c) return <PaginatedList items={c.c09} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />;
    if (ruleKey === "c10" && c) return <PaginatedList items={c.c10} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />;
    if (ruleKey === "c11" && c) return <PaginatedList items={c.c11} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />;
    if (ruleKey === "c12" && c) return <PaginatedList items={c.c12} renderItem={(item: ContactIssue) => <ContactIssueRow key={item.id} contact={item} />} />;

    // ── Companies
    if (ruleKey === "co01" && co) return <RateBlock rateResult={co.co01} />;
    if (ruleKey === "co02" && co) return <PaginatedList items={co.co02} renderItem={(cluster: CompanyDuplicateCluster) => <CompanyDuplicateClusterRow key={cluster.normalizedValue} cluster={cluster} />} />;
    if (ruleKey === "co03" && co) return <PaginatedList items={co.co03} renderItem={(cluster: CompanyDuplicateCluster) => <CompanyDuplicateClusterRow key={`${cluster.normalizedValue}-${cluster.members[0]?.id}`} cluster={cluster} />} />;
    if (ruleKey === "co04" && co) return <PaginatedList items={co.co04} renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />} />;
    if (ruleKey === "co05" && co) return <PaginatedList items={co.co05} renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />} />;
    if (ruleKey === "co06" && co) return <PaginatedList items={co.co06} renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />} />;
    if (ruleKey === "co07" && co) return <PaginatedList items={co.co07} renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />} />;
    if (ruleKey === "co08" && co) return <PaginatedList items={co.co08} renderItem={(item: CompanyIssue) => <CompanyIssueRow key={item.id} company={item} />} />;

    // ── Workflows
    if (ruleKey === "w1" && w) return <PaginatedList items={w.w1} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w2" && w) return <PaginatedList items={w.w2} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w3" && w) return <PaginatedList items={w.w3} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w4" && w) return <PaginatedList items={w.w4} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w5" && w) return <PaginatedList items={w.w5} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w6" && w) return <PaginatedList items={w.w6} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;
    if (ruleKey === "w7" && w) return <PaginatedList items={w.w7} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />;

    // ── Users
    if (ruleKey === "u01" && u) return <PaginatedList items={u.u01} renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />} />;
    if (ruleKey === "u02" && u && u.u02.triggered) return (
      <div>
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-semibold text-red-400">{u.u02.superAdminCount}</span> Super Admins sur <span className="font-medium text-gray-200">{u.u02.totalUsers}</span> utilisateurs ({Math.round(u.u02.rate * 100)}%)
        </p>
        <p className="text-xs text-gray-500 mb-3">Seuil recommandé : {u.u02.threshold}</p>
        {u.u02.superAdmins.length > 0 && <PaginatedList items={u.u02.superAdmins} renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />} />}
      </div>
    );
    if (ruleKey === "u03" && u) return <PaginatedList items={u.u03} renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />} />;
    if (ruleKey === "u04" && u) {
      if (u.u04.disabled) return <p className="text-sm text-gray-500 italic">{u.u04.disabledReason}</p>;
      return (
        <div>
          {u.u04.triggered && <p className="text-sm text-amber-400 font-medium mb-3">{Math.round(u.u04.dominantRate * 100)}% de vos utilisateurs partagent le même rôle.</p>}
          {u.u04.distribution.length > 0 && (
            <div className="rounded-md border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-3 py-2 font-medium">Rôle</th>
                  <th className="text-right px-3 py-2 font-medium">Utilisateurs</th>
                  <th className="text-right px-3 py-2 font-medium">%</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-700">
                  {u.u04.distribution.map((dd: RoleDistribution, i: number) => (
                    <tr key={dd.roleId ?? "__null__"} className={i === 0 && u.u04.triggered ? "bg-amber-500/5" : ""}>
                      <td className="px-3 py-2 text-gray-200 font-medium">{dd.roleName}{i === 0 && u.u04.triggered && <Badge variant="critique" className="ml-2">Dominant</Badge>}</td>
                      <td className="px-3 py-2 text-right text-gray-300 tabular-nums">{dd.count}</td>
                      <td className="px-3 py-2 text-right text-gray-400 tabular-nums">{Math.round(dd.percentage * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    if (ruleKey === "u05" && u) return (
      <div>
        {!u.u05.isEnterprise && (
          <div className="rounded-md bg-amber-500/10 border border-amber-500/15 px-3 py-2 mb-3">
            <p className="text-xs text-amber-300/80">
              L&apos;historique de connexion n&apos;est disponible que sur les comptes HubSpot Enterprise. Cette détection se base sur l&apos;absence d&apos;objets CRM assignés.
            </p>
          </div>
        )}
        <PaginatedList items={u.u05.inactiveUsers} renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />} />
      </div>
    );
    if (ruleKey === "u06" && u) return <PaginatedList items={u.u06} renderItem={(item: TeamIssue) => (
      <div key={item.teamId} className="flex items-center justify-between rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <span className="font-medium text-gray-200">{item.name}</span>
        <span className="text-xs text-gray-500">ID: {item.teamId}</span>
      </div>
    )} />;
    if (ruleKey === "u07" && u) return <PaginatedList items={u.u07} renderItem={(item: UserIssue) => <UserIssueRow key={item.userId} user={item} />} />;

    // ── Deals
    if (ruleKey === "d01" && d) return <RateBlock rateResult={d.d01} />;
    if (ruleKey === "d02" && d) return <RateBlock rateResult={d.d02} />;
    if (ruleKey === "d03" && d) return <PaginatedList items={d.d03} renderItem={(item: DealDetailIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.name}</span><span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span></div>
        <span className="text-xs text-red-400 font-medium">{item.ageInDays}j</span>
      </div>
    )} />;
    if (ruleKey === "d04" && d) return <PaginatedList items={d.d04} renderItem={(item: PipelineStageIssue) => (
      <div key={`${item.pipeline}-${item.stage}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipeline} → {item.stage}</span><span className="text-xs text-amber-400">{item.deals.length} deal{item.deals.length !== 1 ? "s" : ""}</span></div>
        <p className="text-xs text-gray-500 mt-1">Propriétés manquantes : {item.missingProperties.join(", ")}</p>
      </div>
    )} />;
    if (ruleKey === "d05" && d) return <PaginatedList items={d.d05} renderItem={(group: BlockedDealGroup) => (
      <div key={`${group.pipelineId}-${group.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between mb-1"><span className="font-medium text-gray-200">{group.pipelineLabel} → {group.stageLabel}</span><span className="text-xs text-amber-400">{group.deals.length} deal{group.deals.length !== 1 ? "s" : ""}</span></div>
        <div className="space-y-1">
          {group.deals.slice(0, 5).map((deal) => (<div key={deal.id} className="text-xs text-gray-400 flex justify-between"><span>{deal.name}</span><span className="text-red-400">{deal.daysInStage}j dans ce stage</span></div>))}
          {group.deals.length > 5 && <p className="text-xs text-gray-500">+ {group.deals.length - 5} autres</p>}
        </div>
      </div>
    )} />;
    if (ruleKey === "d06" && d) return <PaginatedList items={d.d06} renderItem={(item: PipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-gray-500">{item.stageCount} stages</span></div>
    )} />;
    if (ruleKey === "d07" && d) return <PaginatedList items={d.d07} renderItem={(item: PipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{item.activeStageCount} stages actifs</span></div>
    )} />;
    if (ruleKey === "d08" && d) return <PaginatedList items={d.d08} renderItem={(item: DealDetailIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
    )} />;
    if (ruleKey === "d09" && d) return <PaginatedList items={d.d09} renderItem={(item: DealDetailIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
    )} />;
    if (ruleKey === "d10" && d && !d.d10.disabled) return <PaginatedList items={d.d10.deals} renderItem={(item: DealDetailIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
    )} />;
    if (ruleKey === "d11" && d) return <PaginatedList items={d.d11} renderItem={(item: DealDetailIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
    )} />;
    if (ruleKey === "d12" && d) return <PaginatedList items={d.d12} renderItem={(item: PipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{Math.round((item.skippedRate ?? 0) * 100)}% des deals</span></div>
        {item.topSkippedStages && item.topSkippedStages.length > 0 && <p className="text-xs text-gray-500 mt-1">Stages les plus sautés : {item.topSkippedStages.map((s) => s.stageLabel).join(", ")}</p>}
      </div>
    )} />;
    if (ruleKey === "d13" && d) return <PaginatedList items={d.d13} renderItem={(item: PipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{Math.round((item.nonStandardEntryRate ?? 0) * 100)}% hors 1ère étape</span></div>
      </div>
    )} />;
    if (ruleKey === "d14" && d) return <PaginatedList items={d.d14} renderItem={(item: PipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span></div>
        {item.closedWonStages && item.closedWonStages.length > 1 && <p className="text-xs text-gray-500 mt-1">Gagné : {item.closedWonStages.map((s) => s.label).join(", ")}</p>}
        {item.closedLostStages && item.closedLostStages.length > 1 && <p className="text-xs text-gray-500 mt-1">Perdu : {item.closedLostStages.map((s) => s.label).join(", ")}</p>}
      </div>
    )} />;
    if (ruleKey === "d15" && d) return <PaginatedList items={d.d15} renderItem={(item: StageRuleResult) => (
      <div key={`${item.pipelineId}-${item.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="mx-1 text-gray-600">→</span><span className="text-gray-300">{item.stageLabel}</span></div>
        {item.lastActivity && <span className="text-xs text-gray-500">Dernière activité : {new Date(item.lastActivity).toLocaleDateString("fr-FR")}</span>}
      </div>
    )} />;

    // ── Leads
    if (ruleKey === "l01" && l) return <PaginatedList items={l.l01} renderItem={(item: LeadIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.name}</span><span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span></div>
        <span className="text-xs text-red-400 font-medium">{item.ageInDays}j</span>
      </div>
    )} />;
    if (ruleKey === "l02" && l) return <PaginatedList items={l.l02} renderItem={(group: LeadBlockedGroup) => (
      <div key={`${group.pipelineId}-${group.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between mb-1"><span className="font-medium text-gray-200">{group.pipelineLabel} → {group.stageLabel}</span><span className="text-xs text-amber-400">{group.leads.length} lead{group.leads.length !== 1 ? "s" : ""}</span></div>
        <div className="space-y-1">
          {group.leads.slice(0, 5).map((lead) => (<div key={lead.id} className="text-xs text-gray-400 flex justify-between"><span>{lead.name}</span><span className="text-red-400">{lead.daysInStage}j dans ce stage</span></div>))}
          {group.leads.length > 5 && <p className="text-xs text-gray-500">+ {group.leads.length - 5} autres</p>}
        </div>
      </div>
    )} />;
    if (ruleKey === "l03" && l) return <PaginatedList items={l.l03} renderItem={(item: LeadIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
    )} />;
    if (ruleKey === "l04" && l) return <PaginatedList items={l.l04} renderItem={(item: LeadIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.name}</span><span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span></div>
        <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    )} />;
    if (ruleKey === "l05" && l) return <PaginatedList items={l.l05} renderItem={(item: LeadPipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-gray-500">{item.stageCount} stages</span></div>
    )} />;
    if (ruleKey === "l06" && l) return <PaginatedList items={l.l06} renderItem={(item: LeadPipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{item.activeStageCount} stages actifs</span></div>
    )} />;
    if (ruleKey === "l07" && l) return <PaginatedList items={l.l07} renderItem={(item: LeadPipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{Math.round((item.skippedRate ?? 0) * 100)}% des leads</span></div>
        {item.topSkippedStages && item.topSkippedStages.length > 0 && <p className="text-xs text-gray-500 mt-1">Stages les plus sautés : {item.topSkippedStages.map((s) => s.stageLabel).join(", ")}</p>}
      </div>
    )} />;
    if (ruleKey === "l08" && l) return <PaginatedList items={l.l08} renderItem={(item: LeadPipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="text-xs text-amber-400">{Math.round((item.nonStandardEntryRate ?? 0) * 100)}% hors 1ère étape</span></div>
      </div>
    )} />;
    if (ruleKey === "l09" && l) return <PaginatedList items={l.l09} renderItem={(item: LeadPipelineRuleResult) => (
      <div key={item.pipelineId} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm">
        <div className="flex items-center justify-between"><span className="font-medium text-gray-200">{item.pipelineLabel}</span></div>
        {item.qualifiedStages && item.qualifiedStages.length > 1 && <p className="text-xs text-gray-500 mt-1">Qualified : {item.qualifiedStages.map((s) => s.label).join(", ")}</p>}
        {item.disqualifiedStages && item.disqualifiedStages.length > 1 && <p className="text-xs text-gray-500 mt-1">Disqualified : {item.disqualifiedStages.map((s) => s.label).join(", ")}</p>}
      </div>
    )} />;
    if (ruleKey === "l10" && l) return <PaginatedList items={l.l10} renderItem={(item: LeadStageRuleResult) => (
      <div key={`${item.pipelineId}-${item.stageId}`} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.pipelineLabel}</span><span className="mx-1 text-gray-600">→</span><span className="text-gray-300">{item.stageLabel}</span></div>
        {item.lastActivity && <span className="text-xs text-gray-500">Dernière activité : {new Date(item.lastActivity).toLocaleDateString("fr-FR")}</span>}
      </div>
    )} />;
    if (ruleKey === "l11" && l && l.l11.triggered) return (
      <div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-amber-400">{l.l11.withoutReason}</span> leads sans motif sur <span className="font-medium text-gray-200">{l.l11.totalDisqualified}</span> disqualifiés ({Math.round(l.l11.rate * 100)}%)</p>
        <PaginatedList items={l.l11.leads} renderItem={(item: LeadIssue) => (
          <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between"><span className="font-medium text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.pipelineLabel}</span></div>
        )} />
      </div>
    );
    if (ruleKey === "l12" && l && l.l12.triggered && !l.l12.disabled && l.l12.propertyName) return (
      <div className="text-sm text-gray-300">
        <p className="mb-2">La propriété <span className="font-mono text-amber-400">{l.l12.propertyName}</span> est de type <span className="font-mono text-amber-400">{l.l12.propertyType}</span>.</p>
        <p className="text-xs text-gray-400">Recommandation : convertir en type <span className="font-medium text-gray-200">enumeration</span> avec des valeurs prédéfinies.</p>
      </div>
    );
    if (ruleKey === "l13" && l && l.l13.triggered) return (
      <div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-red-400">{l.l13.withoutDeal}</span> leads sans deal sur <span className="font-medium text-gray-200">{l.l13.totalQualified}</span> qualifiés ({Math.round(l.l13.rate * 100)}%)</p>
        <PaginatedList items={l.l13.leads} renderItem={(item: LeadIssue) => (
          <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
            <div><span className="font-medium text-gray-200">{item.name}</span><span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span></div>
            <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
          </div>
        )} />
      </div>
    );
    if (ruleKey === "l14" && l) return <PaginatedList items={l.l14} renderItem={(item: LeadIssue) => (
      <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
        <div><span className="font-medium text-gray-200">{item.name}</span><span className="ml-2 text-xs text-gray-500">{item.pipelineLabel} → {item.stageLabel}</span></div>
        <span className="text-xs text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}</span>
      </div>
    )} />;

    return null;
  }

  // ─── Flatten, group, quick wins ───────────────────────────────────────

  const allRules = useMemo(() => flattenAllRules({
    propertyResults: r,
    workflowResults: w,
    contactResults: c,
    companyResults: co,
    userResults: u,
    dealResults: d,
    leadResults: l,
    auditedDomains: auditDomains?.selected,
    renderDetail,
  }), [r, w, c, co, u, d, l, auditDomains]);

  const filteredRules = useMemo(() =>
    activeDomain ? allRules.filter((rule) => rule.domainId === activeDomain) : allRules
  , [allRules, activeDomain]);

  const groups = useMemo(() => groupBySeverity(filteredRules), [filteredRules]);

  const quickWins = useMemo(() =>
    activeDomain === null ? generateQuickWins(allRules) : []
  , [allRules, activeDomain]);

  // ─── Active domain info (for domain-filtered hero) ────────────────────

  const activeDomainInfo = activeDomain ? domainsList.find((dd) => dd.id === activeDomain) : null;
  const activeDomainScore = activeDomainInfo?.score ?? null;
  const activeDomainLabel = activeDomainInfo?.label ?? "";

  // Count triggered rules in filtered view
  const triggeredCount = filteredRules.filter((r) => !r.isEmpty).length;
  const totalRulesCount = filteredRules.length;

  // Domain-specific metadata
  function getDomainMeta(): string {
    if (!activeDomain) return "";
    if (activeDomain === "contacts" && c?.hasContacts) return `${c.totalContacts.toLocaleString("fr-FR")} contacts analysés`;
    if (activeDomain === "companies" && co?.hasCompanies) return `${co.totalCompanies.toLocaleString("fr-FR")} companies analysées`;
    if (activeDomain === "deals" && d?.hasDeals) return `${d.totalOpenDeals.toLocaleString("fr-FR")} deals ouverts · ${d.totalPipelines} pipeline${d.totalPipelines !== 1 ? "s" : ""}`;
    if (activeDomain === "leads" && l?.hasLeads) return `${(l.totalLeads ?? 0).toLocaleString("fr-FR")} leads · ${l.totalPipelines ?? 0} pipeline${(l.totalPipelines ?? 0) !== 1 ? "s" : ""}`;
    if (activeDomain === "workflows" && w?.hasWorkflows) return `${w.totalWorkflows} workflows analysés`;
    if (activeDomain === "users" && u?.hasUsers) return `${u.totalUsers} utilisateurs · ${u.totalTeams} équipe${u.totalTeams !== 1 ? "s" : ""}`;
    if (activeDomain === "properties") {
      const total = Object.values(r.customPropertyCounts).reduce((a, b) => a + b, 0);
      return `${total} propriétés custom analysées`;
    }
    return "";
  }

  // ─── Severity counts for hero text ────────────────────────────────────

  const totalCritiques = groups.critiques.length;
  const totalAvertissements = groups.avertissements.length;
  const totalInfos = groups.infos.length;

  // ─── Render ───────────────────────────────────────────────────────────

  const sidebarProps = {
    domains: domainsList,
    activeDomain,
    onDomainSelect: setActiveDomain,
    isPublic,
    shareToken,
  };

  // Register sidebar state with app-level sidebar (authenticated views)
  const { register, unregister } = useReportSidebar();
  useEffect(() => {
    if (!isPublic) {
      register({
        domains: domainsList,
        activeDomain,
        onDomainSelect: setActiveDomain,
        shareToken: shareToken ?? null,
        isPublic: false,
      });
    }
    return () => { if (!isPublic) unregister(); };
  }, [isPublic, domainsList, activeDomain, shareToken, register, unregister]);

  return (
    <div className={isPublic ? "" : ""}>
      <ReportLayout
        sidebar={isPublic ? sidebarProps : null}
      >
        {/* Mobile sidebar toggle (public only — authenticated uses app sidebar) */}
        {isPublic && <MobileSidebarToggle {...sidebarProps} />}

        {/* Breadcrumb */}
        {!isPublic && (
          <Breadcrumb items={[
            { label: portalName ?? "Workspace" },
            { label: `Audit du ${dateStr}` },
          ]} />
        )}

        {/* Hero */}
        <Card
          className={`${getScoreBg(activeDomain === null ? displayScore : (activeDomainScore ?? displayScore))} border-gray-700`}
          padding="standard"
        >
          <div className="flex items-center gap-5 flex-wrap">
            <ScoreCircle
              score={activeDomain === null ? displayScore : (activeDomainScore ?? displayScore)}
              size="lg"
              className="w-20 h-20 !text-[1.5rem]"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-medium text-gray-100">
                {activeDomain === null ? displayLabel : activeDomainLabel}
              </h1>

              {/* Résumé texte */}
              {activeDomain === null ? (
                <p className="text-[12.5px] text-gray-400 leading-relaxed mt-1">
                  {llmSummary || (
                    <>
                      Votre workspace présente {totalCritiques > 0 && <>{totalCritiques} critique{totalCritiques !== 1 ? "s" : ""}</>}
                      {totalCritiques > 0 && totalAvertissements > 0 && " et "}
                      {totalAvertissements > 0 && <>{totalAvertissements} avertissement{totalAvertissements !== 1 ? "s" : ""}</>}
                      {totalCritiques === 0 && totalAvertissements === 0 && "aucun problème critique"}
                      . {getScoreLabel(displayScore)} avec un score de {displayScore}/100.
                    </>
                  )}
                </p>
              ) : (
                <p className="text-[12.5px] text-gray-400 leading-relaxed mt-1">
                  {activeDomainScore != null && getScoreLabel(activeDomainScore)}
                  {triggeredCount > 0
                    ? ` — ${triggeredCount} règle${triggeredCount !== 1 ? "s" : ""} déclenchée${triggeredCount !== 1 ? "s" : ""} sur ${totalRulesCount} analysées`
                    : ` — toutes les règles sont conformes`
                  }
                </p>
              )}

              {/* Métadonnées */}
              <p className="text-[11px] text-gray-500 mt-1.5">
                {activeDomain === null ? (
                  <>
                    {portalName && <><span className="font-medium text-gray-400">{portalName}</span> · </>}
                    {(r.objectCounts.contacts ?? 0).toLocaleString("fr-FR")} contacts ·{" "}
                    {(r.objectCounts.companies ?? 0).toLocaleString("fr-FR")} companies ·{" "}
                    {(r.objectCounts.deals ?? 0).toLocaleString("fr-FR")} deals ·{" "}
                    {dateStr}
                    {executionDurationMs != null && ` · ${Math.round(executionDurationMs / 1000)}s`}
                    {scoreDelta != null && scoreDelta !== 0 && (
                      <span className={`ml-2 font-medium ${scoreDelta > 0 ? "text-green-400" : "text-red-400"}`}>
                        {scoreDelta > 0 ? "+" : ""}{scoreDelta} pts vs dernier audit
                      </span>
                    )}
                    {scoreDelta === 0 && (
                      <span className="ml-2 text-gray-500">= dernier audit</span>
                    )}
                  </>
                ) : (
                  <>{getDomainMeta()}</>
                )}
              </p>
            </div>
          </div>
        </Card>


        {/* Domain Score Grid */}
        <DomainScoreGrid
          domains={domainsList}
          activeDomain={activeDomain}
          onDomainClick={setActiveDomain}
        />

        {/* Quick Wins (only in dashboard view) */}
        {activeDomain === null && quickWins.length > 0 && (
          <QuickWinsCallout recommendations={quickWins} />
        )}

        {/* Scope alerts for leads/users */}
        {activeDomain === "leads" && l?.scopeError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">{l.scopeError}</p>
                <p className="text-xs text-red-400/70 mt-1">Rendez-vous dans Dashboard → Connexions HubSpot pour re-autoriser l&apos;application.</p>
              </div>
            </div>
          </div>
        )}
        {activeDomain === "users" && u?.scopeError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">{u.scopeError}</p>
                <p className="text-xs text-red-400/70 mt-1">Rendez-vous dans Dashboard → Connexions HubSpot pour re-autoriser l&apos;application.</p>
              </div>
            </div>
          </div>
        )}

        {/* Severity Sections */}
        <SeveritySection title="Actions critiques" count={groups.critiques.length}>
          {groups.critiques.map((rule) => (
            <RuleListItem
              key={rule.ruleKey}
              title={rule.title}
              description={rule.description}
              severity="critique"
              domainLabel={rule.domainLabel}
              count={rule.count}
              hasBusinessImpact={rule.hasBusinessImpact}
              expandable
            >
              {getRuleDetail(rule.ruleKey)}
              <ImpactBlock ruleKey={rule.ruleKey} />
            </RuleListItem>
          ))}
        </SeveritySection>

        <SeveritySection title="Avertissements" count={groups.avertissements.length}>
          {groups.avertissements.map((rule) => (
            <RuleListItem
              key={rule.ruleKey}
              title={rule.title}
              description={rule.description}
              severity="avertissement"
              domainLabel={rule.domainLabel}
              count={rule.count}
              hasBusinessImpact={rule.hasBusinessImpact}
              expandable
            >
              {getRuleDetail(rule.ruleKey)}
              <ImpactBlock ruleKey={rule.ruleKey} />
            </RuleListItem>
          ))}
        </SeveritySection>

        <SeveritySection title="Informations" count={groups.infos.length}>
          {groups.infos.map((rule) => (
            <RuleListItem
              key={rule.ruleKey}
              title={rule.title}
              description={rule.description}
              severity="info"
              domainLabel={rule.domainLabel}
              count={rule.count}
              hasBusinessImpact={rule.hasBusinessImpact}
              expandable
            >
              {getRuleDetail(rule.ruleKey)}
              <ImpactBlock ruleKey={rule.ruleKey} />
            </RuleListItem>
          ))}
        </SeveritySection>

        <SeveritySection title="Conformes" count={groups.conformes.length}>
          {groups.conformes.map((rule) => (
            <RuleListItem
              key={rule.ruleKey}
              title={rule.title}
              severity="ok"
              domainLabel={rule.domainLabel}
              expandable={false}
            />
          ))}
        </SeveritySection>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-700 mt-4">
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
      </ReportLayout>
    </div>
  );
}
