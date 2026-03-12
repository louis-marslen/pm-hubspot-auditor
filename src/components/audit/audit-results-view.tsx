"use client";

import { AuditResults, PropertyIssue, PropertyPair, TypingIssue, DealIssue, PipelineStageIssue, RateResult } from "@/lib/audit/types";
import { BUSINESS_IMPACTS } from "@/lib/audit/business-impact";
import { PaginatedList } from "@/components/audit/paginated-list";

function ScoreCircle({ score }: { score: number }) {
  const color =
    score <= 40
      ? "text-red-600 border-red-400"
      : score <= 70
      ? "text-orange-500 border-orange-400"
      : score <= 90
      ? "text-yellow-500 border-yellow-400"
      : "text-green-600 border-green-400";

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

function RuleSection({
  title, ruleKey, severity, isEmpty, children,
}: {
  title: string; ruleKey: string; severity: "critique" | "avertissement" | "info";
  isEmpty: boolean; children: React.ReactNode;
}) {
  const impact = BUSINESS_IMPACTS[ruleKey];
  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={severity} />
            <span className="text-xs text-gray-400 uppercase tracking-wide">{ruleKey.toUpperCase()}</span>
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      {children}
      {!isEmpty && impact && (
        <div className="mt-4 rounded-md bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Impact business</p>
          <p className="text-xs text-amber-700">{impact.estimation}</p>
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

export function AuditResultsView({ r, startedAt }: { r: AuditResults; startedAt: string }) {
  return (
    <div className="space-y-10">

      {/* En-tête : score global */}
      <section className="rounded-lg border bg-white p-6 flex items-center gap-8">
        <ScoreCircle score={r.score} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Score de santé : {r.scoreLabel}</h1>
          <div className="flex gap-4 text-sm mt-2">
            <span className="text-red-600 font-medium">{r.totalCritiques} critique{r.totalCritiques !== 1 ? "s" : ""}</span>
            <span className="text-orange-500 font-medium">{r.totalAvertissements} avertissement{r.totalAvertissements !== 1 ? "s" : ""}</span>
            <span className="text-blue-600 font-medium">{r.totalInfos} info{r.totalInfos !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Analysé : {(r.objectCounts.contacts ?? 0).toLocaleString("fr-FR")} contacts ·{" "}
            {(r.objectCounts.companies ?? 0).toLocaleString("fr-FR")} companies ·{" "}
            {(r.objectCounts.deals ?? 0).toLocaleString("fr-FR")} deals
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Audit du {new Date(startedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

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

          <RuleSection title="Propriétés vides depuis plus de 90 jours" ruleKey="p1" severity="critique" isEmpty={r.p1.length === 0}>
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

          <RuleSection title="Propriétés sous-utilisées (fill rate < 5%)" ruleKey="p2" severity="avertissement" isEmpty={r.p2.length === 0}>
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

          <RuleSection title="Doublons de propriétés (labels similaires)" ruleKey="p3" severity="avertissement" isEmpty={r.p3.length === 0}>
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

          <RuleSection title="Propriétés sans description" ruleKey="p4" severity="info" isEmpty={r.p4.length === 0}>
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

          <RuleSection title="Propriétés non organisées (groupe par défaut)" ruleKey="p5" severity="info" isEmpty={r.p5.length === 0}>
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

          <RuleSection title="Types de données inadaptés" ruleKey="p6" severity="avertissement" isEmpty={r.p6.length === 0}>
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

          <RuleSection title="Taux de contacts avec email renseigné" ruleKey="p7" severity="critique" isEmpty={!r.p7.triggered}>
            <RateCard result={r.p7} label="contacts avec email" />
          </RuleSection>

          <RuleSection title="Contacts sans prénom ni nom" ruleKey="p8" severity="avertissement" isEmpty={r.p8.count === 0}>
            {r.p8.count > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-orange-600">{r.p8.count.toLocaleString("fr-FR")}</span> contacts sans identité
              </p>
            )}
          </RuleSection>

          <RuleSection title="Taux de contacts avec lifecycle stage" ruleKey="p9" severity="avertissement" isEmpty={!r.p9.triggered}>
            <RateCard result={r.p9} label="contacts avec lifecycle" />
          </RuleSection>

          <RuleSection title="Contacts avec lifecycle incohérent" ruleKey="p10a" severity="avertissement" isEmpty={r.p10a.count === 0}>
            {r.p10a.count > 0 && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-orange-600">{r.p10a.count.toLocaleString("fr-FR")}</span> contacts avec lifecycle renseigné mais pas &quot;customer&quot;
              </p>
            )}
          </RuleSection>

          <RuleSection title="Aucun MQL ni SQL avec des deals ouverts" ruleKey="p10c" severity="critique" isEmpty={!r.p10c.triggered}>
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

          <RuleSection title="Taux de contacts rattachés à une company" ruleKey="p11" severity="avertissement" isEmpty={r.p11 === null || !r.p11.triggered}>
            {r.p11 === null ? (
              <p className="text-sm text-gray-500 italic">Règle non applicable — aucune company détectée (usage B2C possible).</p>
            ) : (
              <RateCard result={r.p11} label="contacts avec company" />
            )}
          </RuleSection>

          <RuleSection title="Taux de companies avec domaine renseigné" ruleKey="p12" severity="avertissement" isEmpty={!r.p12.triggered}>
            <RateCard result={r.p12} label="companies avec domaine" />
          </RuleSection>

        </div>
      </section>

      {/* Deals */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deals</h2>
        <div className="space-y-4">

          <RuleSection title="Taux de deals avec montant renseigné" ruleKey="p13" severity="critique" isEmpty={!r.p13.triggered}>
            <RateCard result={r.p13} label="deals avec montant" />
          </RuleSection>

          <RuleSection title="Taux de deals avec date de clôture" ruleKey="p14" severity="critique" isEmpty={!r.p14.triggered}>
            <RateCard result={r.p14} label="deals avec date de clôture" />
          </RuleSection>

          <RuleSection title="Deals anciens (> 60 jours)" ruleKey="p15" severity="critique" isEmpty={r.p15.length === 0}>
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

          <RuleSection title="Stages avec propriétés requises manquantes" ruleKey="p16" severity="avertissement" isEmpty={r.p16.length === 0}>
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

    </div>
  );
}
