"use client";

import { useState } from "react";
import {
  AuditResults, WorkflowAuditResults, WorkflowIssue,
  PropertyIssue, PropertyPair, TypingIssue, DealIssue, PipelineStageIssue, RateResult,
} from "@/lib/audit/types";
import { BUSINESS_IMPACTS } from "@/lib/audit/business-impact";
import { PaginatedList } from "@/components/audit/paginated-list";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ScoreCircle({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const color =
    score <= 49
      ? "text-red-600 border-red-400"
      : score <= 69
      ? "text-orange-500 border-orange-400"
      : score <= 89
      ? "text-yellow-500 border-yellow-400"
      : "text-green-600 border-green-400";

  if (size === "sm") {
    return (
      <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-4 ${color}`}>
        <span className="text-2xl font-bold">{score}</span>
      </div>
    );
  }

  return (
    <div className={`flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 ${color}`}>
      <span className="text-4xl font-bold">{score}</span>
      <span className="text-xs font-medium">/100</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: "critique" | "avertissement" | "info" }) {
  const styles = {
    critique: "bg-red-100 text-red-700",
    avertissement: "bg-orange-100 text-orange-700",
    info: "bg-blue-100 text-blue-700",
  };
  const labels = { critique: "Critique", avertissement: "Avertissement", info: "Info" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function RuleSection({
  title, ruleKey, severity, isEmpty, children, defaultOpen = false,
}: {
  title: string; ruleKey: string; severity: "critique" | "avertissement" | "info";
  isEmpty: boolean; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const impact = BUSINESS_IMPACTS[ruleKey];

  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={severity} />
            <span className="text-xs text-gray-400 uppercase tracking-wide">{ruleKey.toUpperCase()}</span>
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {isEmpty && (
            <span className="ml-2 text-xs text-green-600 font-medium">✓ OK</span>
          )}
        </div>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t">
          <div className="pt-4">
            {children}
          </div>
          {!isEmpty && impact && (
            <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-800 mb-1">Impact business</p>
              <p className="text-xs text-amber-700">{impact.estimation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RateCard({ result, label }: { result: RateResult; label: string }) {
  const pct = Math.round(result.rate * 100);
  const color = result.triggered ? "text-red-600" : "text-green-600";
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className={`text-2xl font-bold ${color}`}>{pct}%</span>
      <span className="text-gray-600">
        {result.filledCount.toLocaleString("fr-FR")} / {result.totalCount.toLocaleString("fr-FR")} {label}
      </span>
      <span className="text-gray-400 text-xs">(seuil : {Math.round(result.threshold * 100)}%)</span>
    </div>
  );
}

function WorkflowIssueRow({ wf }: { wf: WorkflowIssue }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-gray-900">{wf.name}</span>
        {wf.isLegacy && (
          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Ancien format</span>
        )}
        {wf.notAnalyzed && (
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">Non analysé</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-400">
        <span className={wf.status === "ACTIVE" ? "text-green-600 font-medium" : "text-gray-400"}>
          {wf.status === "ACTIVE" ? "Actif" : "Inactif"}
        </span>
        {wf.errorRate !== null && (
          <span className="text-red-600 font-medium">{wf.errorRate}% d&apos;erreurs</span>
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

  function handleCopyLink() {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  const totalCritiques = r.totalCritiques + (w?.totalCritiques ?? 0);
  const totalAvertissements = r.totalAvertissements + (w?.totalAvertissements ?? 0);
  const totalInfos = r.totalInfos + (w?.totalInfos ?? 0);

  return (
    <div className="space-y-10">

      {/* En-tête : score global */}
      <section className="rounded-lg border bg-white p-6 flex items-center gap-8">
        <ScoreCircle score={displayScore} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Score de santé : {displayLabel}</h1>
          <div className="flex gap-4 text-sm mt-2">
            <span className="text-red-600 font-medium">{totalCritiques} critique{totalCritiques !== 1 ? "s" : ""}</span>
            <span className="text-orange-500 font-medium">{totalAvertissements} avertissement{totalAvertissements !== 1 ? "s" : ""}</span>
            <span className="text-blue-600 font-medium">{totalInfos} info{totalInfos !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {portalName && <><span className="font-medium">{portalName}</span> · </>}
            {(r.objectCounts.contacts ?? 0).toLocaleString("fr-FR")} contacts ·{" "}
            {(r.objectCounts.companies ?? 0).toLocaleString("fr-FR")} companies ·{" "}
            {(r.objectCounts.deals ?? 0).toLocaleString("fr-FR")} deals
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Audit du {new Date(startedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            {executionDurationMs != null && ` · ${Math.round(executionDurationMs / 1000)}s`}
          </p>
        </div>

        {/* Score breakdown + lien public */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-4 text-center">
            <div>
              <ScoreCircle score={r.score} size="sm" />
              <p className="text-xs text-gray-500 mt-1">Propriétés</p>
            </div>
            {w?.hasWorkflows && w.score !== null && (
              <div>
                <ScoreCircle score={w.score} size="sm" />
                <p className="text-xs text-gray-500 mt-1">Workflows</p>
              </div>
            )}
          </div>
          {!isPublic && shareToken && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs text-gray-500 hover:text-orange-600 underline transition-colors"
            >
              Copier le lien public
            </button>
          )}
        </div>
      </section>

      {/* Résumé LLM */}
      {(llmSummary || (!isPublic)) && (
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Résumé exécutif</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {llmSummary ?? "Le résumé exécutif n'a pas pu être généré."}
          </p>
        </section>
      )}

      {/* Section Workflows */}
      {w !== undefined && w !== null && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflows</h2>

          {!w.hasWorkflows ? (
            <div className="rounded-lg border bg-white p-5 text-sm text-gray-500 italic">
              Aucun workflow détecté — domaine exclu du score global.
            </div>
          ) : (
            <div className="space-y-4">

              {w.notAnalyzed.length > 0 && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {w.notAnalyzed.length} workflow{w.notAnalyzed.length > 1 ? "s" : ""} n&apos;ont pas pu être analysés.
                </div>
              )}

              <RuleSection title="Workflows actifs avec taux d'erreur > 10%" ruleKey="w1" severity="critique" isEmpty={w.w1.length === 0} defaultOpen={w.w1.length > 0}>
                <PaginatedList items={w.w1} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

              <RuleSection title="Workflows actifs sans actions configurées" ruleKey="w2" severity="critique" isEmpty={w.w2.length === 0} defaultOpen={w.w2.length > 0}>
                <PaginatedList items={w.w2} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

              <RuleSection
                title={`Workflows actifs sans enrôlement récent (> ${90}j)`}
                ruleKey="w3" severity="avertissement" isEmpty={w.w3.length === 0}
                defaultOpen={false}
              >
                <PaginatedList
                  items={w.w3}
                  renderItem={(wf: WorkflowIssue) => (
                    <div key={wf.id} className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium text-gray-900">{wf.name}</span>
                      <span className="text-xs text-orange-600 font-medium flex-shrink-0">
                        {wf.lastEnrollmentAt === null ? "Jamais utilisé" : "Anciennement actif"}
                      </span>
                    </div>
                  )}
                />
              </RuleSection>

              <RuleSection title="Workflows inactifs depuis plus de 90 jours" ruleKey="w4" severity="avertissement" isEmpty={w.w4.length === 0} defaultOpen={false}>
                <PaginatedList items={w.w4} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

              <RuleSection title="Workflows récemment désactivés" ruleKey="w5" severity="info" isEmpty={w.w5.length === 0} defaultOpen={false}>
                <PaginatedList items={w.w5} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

              <RuleSection title="Workflows avec noms non descriptifs" ruleKey="w6" severity="info" isEmpty={w.w6.length === 0} defaultOpen={false}>
                <PaginatedList items={w.w6} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

              <RuleSection
                title={`Workflows sans dossier (${w.w7.length}/${w.totalWorkflows} — ${w.totalWorkflows > 0 ? Math.round((w.w7.length / w.totalWorkflows) * 100) : 0}% sans dossier)`}
                ruleKey="w7" severity="info" isEmpty={w.w7.length === 0} defaultOpen={false}
              >
                <PaginatedList items={w.w7} renderItem={(wf: WorkflowIssue) => <WorkflowIssueRow key={wf.id} wf={wf} />} />
              </RuleSection>

            </div>
          )}
        </section>
      )}

      {/* Résumé propriétés custom */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Propriétés custom analysées</h2>
        <div className="grid grid-cols-3 gap-4">
          {(["contacts", "companies", "deals"] as const).map((type) => (
            <div key={type} className="rounded-lg border bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{r.customPropertyCounts[type] ?? 0}</p>
              <p className="text-sm text-gray-500 capitalize">{type}</p>
              <p className="text-xs text-gray-400">propriétés custom</p>
            </div>
          ))}
        </div>
      </section>

      {/* Propriétés custom */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Propriétés custom</h2>
        <div className="space-y-4">

          <RuleSection title="Propriétés vides depuis plus de 90 jours" ruleKey="p1" severity="critique" isEmpty={r.p1.length === 0} defaultOpen={r.p1.length > 0}>
            <PaginatedList
              items={r.p1}
              renderItem={(item: PropertyIssue) => (
                <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-400">({item.objectType})</span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Créé le {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Propriétés sous-utilisées (fill rate < 5%)" ruleKey="p2" severity="avertissement" isEmpty={r.p2.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p2}
              renderItem={(item: PropertyIssue) => (
                <div key={item.name} className="flex items-start justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.objectType}</span>
                  </div>
                  <span className="text-xs font-medium text-orange-600 whitespace-nowrap">
                    {item.fillRate !== undefined ? `${Math.round(item.fillRate * 100)}%` : "—"}
                    {item.filledCount !== undefined && item.totalCount !== undefined
                      ? ` (${item.filledCount}/${item.totalCount})`
                      : ""}
                  </span>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Doublons de propriétés (labels similaires)" ruleKey="p3" severity="avertissement" isEmpty={r.p3.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p3}
              renderItem={(item: PropertyPair) => (
                <div key={`${item.a.name}-${item.b.name}`} className="rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{item.a.label}</span>
                    <span className="text-gray-400">↔</span>
                    <span className="font-medium text-gray-900">{item.b.label}</span>
                    <span className="text-xs text-orange-600 font-medium ml-auto">
                      {Math.round(item.similarity * 100)}% similaires
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.a.objectType}</p>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Propriétés sans description" ruleKey="p4" severity="info" isEmpty={r.p4.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p4}
              renderItem={(item: PropertyIssue) => (
                <div key={item.name} className="rounded-md border px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.objectType}</span>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Propriétés non organisées (groupe par défaut)" ruleKey="p5" severity="info" isEmpty={r.p5.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p5}
              renderItem={(item: PropertyIssue) => (
                <div key={item.name} className="rounded-md border px-3 py-2 text-sm flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.objectType}</span>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Types de données inadaptés" ruleKey="p6" severity="avertissement" isEmpty={r.p6.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p6}
              renderItem={(item: TypingIssue) => (
                <div key={item.name} className="rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="text-xs text-orange-600">{item.currentType} → {item.suggestedType}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                </div>
              )}
            />
          </RuleSection>

        </div>
      </section>

      {/* Contacts */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
        <div className="space-y-4">

          <RuleSection title="Taux de contacts avec email renseigné" ruleKey="p7" severity="critique" isEmpty={!r.p7.triggered} defaultOpen={r.p7.triggered}>
            <RateCard result={r.p7} label="contacts avec email" />
          </RuleSection>

          <RuleSection title="Contacts sans prénom ni nom" ruleKey="p8" severity="avertissement" isEmpty={r.p8.count === 0} defaultOpen={false}>
            {r.p8.count > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-orange-600">{r.p8.count.toLocaleString("fr-FR")}</span> contacts sans identité
              </p>
            )}
          </RuleSection>

          <RuleSection title="Taux de contacts avec lifecycle stage" ruleKey="p9" severity="avertissement" isEmpty={!r.p9.triggered} defaultOpen={false}>
            <RateCard result={r.p9} label="contacts avec lifecycle" />
          </RuleSection>

          <RuleSection title="Contacts avec lifecycle incohérent" ruleKey="p10a" severity="avertissement" isEmpty={r.p10a.count === 0} defaultOpen={false}>
            {r.p10a.count > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-orange-600">{r.p10a.count.toLocaleString("fr-FR")}</span> contacts avec lifecycle renseigné mais pas &quot;customer&quot;
              </p>
            )}
          </RuleSection>

          <RuleSection title="Aucun MQL ni SQL avec des deals ouverts" ruleKey="p10c" severity="critique" isEmpty={!r.p10c.triggered} defaultOpen={r.p10c.triggered}>
            {r.p10c.triggered && (
              <p className="text-sm text-red-700 font-medium">Votre entonnoir de qualification n&apos;est pas tracé dans HubSpot.</p>
            )}
          </RuleSection>

        </div>
      </section>

      {/* Companies */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Companies</h2>
        <div className="space-y-4">

          <RuleSection title="Taux de contacts rattachés à une company" ruleKey="p11" severity="avertissement" isEmpty={r.p11 === null || !r.p11.triggered} defaultOpen={false}>
            {r.p11 === null ? (
              <p className="text-sm text-gray-500 italic">Règle non applicable — aucune company détectée (usage B2C possible).</p>
            ) : (
              <RateCard result={r.p11} label="contacts avec company" />
            )}
          </RuleSection>

          <RuleSection title="Taux de companies avec domaine renseigné" ruleKey="p12" severity="avertissement" isEmpty={!r.p12.triggered} defaultOpen={false}>
            <RateCard result={r.p12} label="companies avec domaine" />
          </RuleSection>

        </div>
      </section>

      {/* Deals */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals</h2>
        <div className="space-y-4">

          <RuleSection title="Taux de deals avec montant renseigné" ruleKey="p13" severity="critique" isEmpty={!r.p13.triggered} defaultOpen={r.p13.triggered}>
            <RateCard result={r.p13} label="deals avec montant" />
          </RuleSection>

          <RuleSection title="Taux de deals avec date de clôture" ruleKey="p14" severity="critique" isEmpty={!r.p14.triggered} defaultOpen={r.p14.triggered}>
            <RateCard result={r.p14} label="deals avec date de clôture" />
          </RuleSection>

          <RuleSection title="Deals anciens (> 60 jours)" ruleKey="p15" severity="critique" isEmpty={r.p15.length === 0} defaultOpen={r.p15.length > 0}>
            <PaginatedList
              items={r.p15}
              renderItem={(item: DealIssue) => (
                <div key={item.id} className="rounded-md border px-3 py-2 text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{item.stage}</span>
                  </div>
                  <span className="text-xs text-red-600 font-medium">{item.ageInDays}j</span>
                </div>
              )}
            />
          </RuleSection>

          <RuleSection title="Stages avec propriétés requises manquantes" ruleKey="p16" severity="avertissement" isEmpty={r.p16.length === 0} defaultOpen={false}>
            <PaginatedList
              items={r.p16}
              renderItem={(item: PipelineStageIssue) => (
                <div key={`${item.pipeline}-${item.stage}`} className="rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.pipeline} → {item.stage}</span>
                    <span className="text-xs text-orange-600">{item.deals.length} deal{item.deals.length !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Propriétés manquantes : {item.missingProperties.join(", ")}
                  </p>
                </div>
              )}
            />
          </RuleSection>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-6">
        Généré par HubSpot Auditor
      </footer>

    </div>
  );
}
