"use client";

import { useState } from "react";
import {
  AuditResults, WorkflowAuditResults, WorkflowIssue,
  PropertyIssue, PropertyPair, TypingIssue, DealIssue, PipelineStageIssue, RateResult,
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
import { ChevronDown, CircleCheck, Share2, ArrowLeft, Sparkles, Copy } from "lucide-react";
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

// ─── Props ───────────────────────────────────────────────────────────────────

interface AuditResultsViewProps {
  r: AuditResults;
  w?: WorkflowAuditResults | null;
  globalScore?: number;
  globalScoreLabel?: string;
  llmSummary?: string | null;
  shareToken?: string | null;
  isPublic?: boolean;
  portalName?: string | null;
  startedAt: string;
  executionDurationMs?: number | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AuditResultsView({
  r, w, globalScore, globalScoreLabel, llmSummary,
  shareToken, isPublic, portalName, startedAt, executionDurationMs,
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

  const totalCritiques = r.totalCritiques + (w?.totalCritiques ?? 0);
  const totalAvertissements = r.totalAvertissements + (w?.totalAvertissements ?? 0);
  const totalInfos = r.totalInfos + (w?.totalInfos ?? 0);

  const dateStr = new Date(startedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Tab counts
  const propCount = r.totalCritiques + r.totalAvertissements + r.totalInfos;
  const workflowCount = w ? (w.totalCritiques + w.totalAvertissements + w.totalInfos) : 0;

  const tabs = [
    { id: "resume", label: "Résumé" },
    { id: "properties", label: "Propriétés", count: propCount > 0 ? propCount : undefined },
    { id: "contacts", label: "Contacts" },
    { id: "companies", label: "Companies" },
    { id: "deals", label: "Deals" },
    ...(w?.hasWorkflows ? [{ id: "workflows", label: "Workflows", count: workflowCount > 0 ? workflowCount : undefined }] : []),
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
                <span className="text-red-400 font-medium">{totalCritiques} critique{totalCritiques !== 1 ? "s" : ""}</span>
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
              {w?.hasWorkflows && w.score !== null && (
                <div>
                  <ScoreCircle score={w.score} size="md" />
                  <p className="text-xs text-gray-500 mt-1">Workflows</p>
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

      {/* Sticky tabs navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sticky
      />

      {/* Executive summary */}
      {llmSummary && (
        <section id="section-resume">
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

      {/* Workflows */}
      {w !== undefined && w !== null && w.hasWorkflows && (
        <section id="section-workflows" className="space-y-4">
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

      {/* Properties summary */}
      <section id="section-properties" className="space-y-4">
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

      {/* Contacts */}
      <section id="section-contacts" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Contacts</h2>

        <RuleCard title="Taux de contacts avec email renseigné" ruleKey="p7" severity="critique" isEmpty={!r.p7.triggered} defaultOpen={r.p7.triggered} rateResult={r.p7}>
          <span />
        </RuleCard>

        <RuleCard title="Contacts sans prénom ni nom" ruleKey="p8" severity="avertissement" isEmpty={r.p8.count === 0} count={r.p8.count}>
          {r.p8.count > 0 && (
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-amber-400">{r.p8.count.toLocaleString("fr-FR")}</span> contacts sans identité
            </p>
          )}
        </RuleCard>

        <RuleCard title="Taux de contacts avec lifecycle stage" ruleKey="p9" severity="avertissement" isEmpty={!r.p9.triggered} rateResult={r.p9}>
          <span />
        </RuleCard>

        <RuleCard title="Contacts avec lifecycle incohérent" ruleKey="p10a" severity="avertissement" isEmpty={r.p10a.count === 0} count={r.p10a.count}>
          {r.p10a.count > 0 && (
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-amber-400">{r.p10a.count.toLocaleString("fr-FR")}</span> contacts avec lifecycle renseigné mais pas &quot;customer&quot;
            </p>
          )}
        </RuleCard>

        <RuleCard title="Aucun MQL ni SQL avec des deals ouverts" ruleKey="p10c" severity="critique" isEmpty={!r.p10c.triggered} defaultOpen={r.p10c.triggered}>
          {r.p10c.triggered && (
            <p className="text-sm text-red-400 font-medium">Votre entonnoir de qualification n&apos;est pas tracé dans HubSpot.</p>
          )}
        </RuleCard>
      </section>

      {/* Companies */}
      <section id="section-companies" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Companies</h2>

        <RuleCard title="Taux de contacts rattachés à une company" ruleKey="p11" severity="avertissement" isEmpty={r.p11 === null || !r.p11.triggered} rateResult={r.p11 ?? undefined}>
          {r.p11 === null ? (
            <p className="text-sm text-gray-500 italic">Règle non applicable — aucune company détectée (usage B2C possible).</p>
          ) : <span />}
        </RuleCard>

        <RuleCard title="Taux de companies avec domaine renseigné" ruleKey="p12" severity="avertissement" isEmpty={!r.p12.triggered} rateResult={r.p12}>
          <span />
        </RuleCard>
      </section>

      {/* Deals */}
      <section id="section-deals" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Deals</h2>

        <RuleCard title="Taux de deals avec montant renseigné" ruleKey="p13" severity="critique" isEmpty={!r.p13.triggered} defaultOpen={r.p13.triggered} rateResult={r.p13}>
          <span />
        </RuleCard>

        <RuleCard title="Taux de deals avec date de clôture" ruleKey="p14" severity="critique" isEmpty={!r.p14.triggered} defaultOpen={r.p14.triggered} rateResult={r.p14}>
          <span />
        </RuleCard>

        <RuleCard title="Deals anciens (> 60 jours)" ruleKey="p15" severity="critique" isEmpty={r.p15.length === 0} count={r.p15.length} defaultOpen={r.p15.length > 0}>
          <PaginatedList
            items={r.p15}
            renderItem={(item: DealIssue) => (
              <div key={item.id} className="rounded-md border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-200">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{item.stage}</span>
                </div>
                <span className="text-xs text-red-400 font-medium">{item.ageInDays}j</span>
              </div>
            )}
          />
        </RuleCard>

        <RuleCard title="Stages avec propriétés requises manquantes" ruleKey="p16" severity="avertissement" isEmpty={r.p16.length === 0} count={r.p16.length}>
          <PaginatedList
            items={r.p16}
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
      </section>

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
