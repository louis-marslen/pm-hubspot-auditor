import OpenAI from "openai";
import { loadKnowledgeBase } from "@/lib/audit/knowledge";
import { BUSINESS_IMPACTS } from "@/lib/audit/business-impact";
import {
  type GlobalAuditResults,
  type AIDiagnostic,
  type AuditDomainSelection,
  AUDIT_DOMAINS,
} from "@/lib/audit/types";

// ─── JSON Schema for structured output ──────────────────────────────────

const clusterSchema = {
  type: "object" as const,
  properties: {
    titre: { type: "string" as const },
    description: { type: "string" as const },
    domaines: { type: "array" as const, items: { type: "string" as const } },
    regles_sources: { type: "array" as const, items: { type: "string" as const } },
    criticite: { type: "string" as const, enum: ["critique", "élevé", "modéré"] },
  },
  required: ["titre", "description", "domaines", "regles_sources", "criticite"] as const,
  additionalProperties: false,
};

const projectSchema = {
  type: "object" as const,
  properties: {
    titre: { type: "string" as const },
    objectif: { type: "string" as const },
    impact_attendu: { type: "string" as const },
    niveau_impact: { type: "string" as const, enum: ["Fort", "Moyen", "Faible"] },
    taille: { type: "string" as const, enum: ["XS", "S", "M", "L", "XL"] },
    priorite: { type: "string" as const, enum: ["P1", "P2", "P3"] },
    domaines: { type: "array" as const, items: { type: "string" as const } },
    actions_cles: { type: "array" as const, items: { type: "string" as const } },
  },
  required: ["titre", "objectif", "impact_attendu", "niveau_impact", "taille", "priorite", "domaines", "actions_cles"] as const,
  additionalProperties: false,
};

export const diagnosticJsonSchema = {
  name: "ai_diagnostic",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      diagnostic: {
        type: "object" as const,
        properties: {
          forces: { type: "array" as const, items: clusterSchema },
          faiblesses: { type: "array" as const, items: clusterSchema },
          risques: { type: "array" as const, items: clusterSchema },
        },
        required: ["forces", "faiblesses", "risques"] as const,
        additionalProperties: false,
      },
      hero_summary: { type: "string" as const },
      roadmap: { type: "array" as const, items: projectSchema },
      backlog: { type: "array" as const, items: projectSchema },
    },
    required: ["diagnostic", "hero_summary", "roadmap", "backlog"] as const,
    additionalProperties: false,
  },
};

// ─── Maturity level from score ──────────────────────────────────────────

function getMaturityLevel(score: number): string {
  if (score <= 49) return "Réactif (Niveau 1)";
  if (score <= 69) return "Structuré (Niveau 2)";
  if (score <= 89) return "Optimisé (Niveau 3)";
  return "Excellence (Niveau 4)";
}

function getScoreLabel(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}

// ─── Prompt builders ────────────────────────────────────────────────────

export function buildSystemPrompt(knowledgeBase: string): string {
  return `Tu es un expert en CRM HubSpot et en opérations revenue (RevOps). Tu analyses les résultats d'un audit automatisé d'un workspace HubSpot pour produire un diagnostic structuré et une roadmap de recommandations actionnables.

## Ton rôle

Tu reçois :
1. Les résultats d'un audit HubSpot : scores par domaine, règles déclenchées avec leur sévérité et nombre d'occurrences, métriques volumétriques
2. Une base de connaissances : best practices HubSpot, modèle de maturité CRM, patterns inter-domaines connus, templates de projets d'amélioration

Tu produis :
1. Un diagnostic structuré (forces / faiblesses / risques) qui croise les résultats de plusieurs domaines
2. Un résumé hero (2-3 phrases) pour le haut du rapport
3. Une roadmap de 5 projets prioritaires + un backlog de projets complémentaires

## Principes

- **Croiser les domaines** : les faiblesses et risques doivent référencer des règles de ≥ 2 domaines différents. Ne pas simplement lister les problèmes domaine par domaine — c'est le travail du rapport existant. Ta valeur ajoutée est le recoupement.
- **Être concret** : utiliser les counts réels de l'audit ("87 contacts sans email" plutôt que "de nombreux contacts"). Les actions clés doivent être exécutables, pas des principes abstraits.
- **Calibrer selon la maturité** : un workspace avec un score de 35 a besoin de fondamentaux. Un workspace à 75 a besoin de raffinement. Ne pas recommander de l'optimisation avancée à un workspace qui n'a pas les bases.
- **Être honnête sur les forces** : si un domaine a un score élevé et des règles conformes, le dire explicitement. Les forces ne sont pas optionnelles — elles crédibilisent le diagnostic.
- **Recommander, pas prescrire** : utiliser "nous recommandons" et non "vous devez". Le ton est celui d'un consultant qui présente ses conclusions, pas d'un auditeur qui impose.
- **Langue** : tout le contenu doit être en français. Les termes HubSpot techniques restent en anglais (workflow, pipeline, deal stage, lifecycle stage, owner, etc.).

## Règles de construction du diagnostic

### Forces
- Identifier les domaines ou aspects bien maîtrisés à partir des scores élevés (≥ 70) et des groupes de règles conformes
- Regrouper par thème transverse quand possible (ex: "Bonne structuration des processus de vente" si deals ET leads ont des scores élevés)
- Minimum 1 force, même sur un workspace en difficulté (trouver ce qui fonctionne)
- Criticité des forces : toujours "modéré" (c'est un constat positif, pas un niveau de criticité)

### Faiblesses
- Utiliser les patterns inter-domaines de la knowledge base pour regrouper les règles déclenchées par thème transverse
- Chaque faiblesse doit référencer des règles de ≥ 2 domaines (sauf si un domaine est très isolé)
- Décrire la cause racine probable et la conséquence, pas juste les symptômes
- Criticité : "critique" si ≥ 1 règle critique dans le cluster, "élevé" si majorité d'avertissements, "modéré" si majoritairement des infos

### Risques
- Les risques sont des combinaisons de faiblesses qui créent un danger systémique
- Formuler comme un scénario futur : "Si X et Y ne sont pas corrigés, alors Z"
- Minimum 0, maximum 3 risques. Pas de risque si le workspace est en bonne santé (score > 80)
- Criticité : calibrer selon la gravité du scénario

### Hero summary
- 2-3 phrases qui résument le diagnostic en langage non technique
- Commencer par le positionnement de maturité ("Votre workspace HubSpot présente un niveau de maturité structuré…")
- Mentionner la principale force ET la principale faiblesse
- Terminer par l'orientation des recommandations ("Les recommandations se concentrent sur…")

### Roadmap (top 5)
- Trier par priorité P1 > P2 > P3, puis par impact Fort > Moyen > Faible
- Les projets P1 traitent les faiblesses critiques
- Les projets P2 traitent les faiblesses élevées ou consolident les fondamentaux
- Les projets P3 sont de l'optimisation
- Adapter la taille (T-shirt) au volume réel observé dans l'audit
- Chaque projet doit avoir 3-5 actions clés concrètes et exécutables
- Ne pas créer de projet pour un domaine sans problème significatif

### Backlog
- Projets moins prioritaires ou de plus faible impact
- Inclure des projets de maintenance/prévention si les fondamentaux sont traités dans la roadmap
- 0 à 5 projets. Pas de backlog si la roadmap couvre tout.

## Base de connaissances

${knowledgeBase}`;
}

interface RuleForPrompt {
  ruleKey: string;
  title: string;
  severity: "critique" | "avertissement" | "info";
  domain: string;
  count: number;
  businessImpact: string;
}

interface AuditDataForPrompt {
  global: GlobalAuditResults;
  selectedDomains?: string[];
  auditDomains?: AuditDomainSelection | null;
}

export function buildUserPrompt(data: AuditDataForPrompt): string {
  const { global, selectedDomains, auditDomains } = data;
  const { globalScore, globalScoreLabel, propertyResults } = global;

  // Domain scores
  const domainScores: string[] = [];
  domainScores.push(`- Propriétés custom : ${propertyResults.score}/100 (${propertyResults.scoreLabel})`);
  if (global.contactResults?.hasContacts) domainScores.push(`- Contacts : ${global.contactResults.score}/100 (${global.contactResults.scoreLabel})`);
  if (global.companyResults?.hasCompanies) domainScores.push(`- Companies : ${global.companyResults.score}/100 (${global.companyResults.scoreLabel})`);
  if (global.dealResults?.hasDeals) domainScores.push(`- Deals & Pipelines : ${global.dealResults.score}/100 (${global.dealResults.scoreLabel})`);
  if (global.leadResults?.hasLeads && !global.leadResults.scopeError) domainScores.push(`- Leads & Prospection : ${global.leadResults.score}/100 (${global.leadResults.scoreLabel})`);
  if (global.workflowResults?.hasWorkflows && global.workflowResults.score !== null) domainScores.push(`- Workflows : ${global.workflowResults.score}/100 (${global.workflowResults.scoreLabel})`);
  if (global.userResults?.hasUsers && !global.userResults.scopeError) domainScores.push(`- Utilisateurs & Équipes : ${global.userResults.score}/100 (${global.userResults.scoreLabel})`);

  // Excluded domains
  const allImplemented = AUDIT_DOMAINS.filter((d) => d.implemented);
  const auditedIds = selectedDomains ?? allImplemented.map((d) => d.id);
  const excludedDomains = allImplemented.filter((d) => !auditedIds.includes(d.id));
  let excludedSection = "";
  if (excludedDomains.length > 0 || auditDomains?.skipped_reasons) {
    const lines: string[] = [];
    for (const d of excludedDomains) {
      lines.push(`- ${d.label} (raison : non sélectionné)`);
    }
    if (auditDomains?.skipped_reasons) {
      for (const [id, reason] of Object.entries(auditDomains.skipped_reasons)) {
        const label = AUDIT_DOMAINS.find((d) => d.id === id)?.label ?? id;
        lines.push(`- ${label} (raison : ${reason})`);
      }
    }
    if (lines.length > 0) {
      excludedSection = `\n## Domaines exclus de l'audit\n\n${lines.join("\n")}\n`;
    }
  }

  // Volumetric metrics
  const totalContacts = propertyResults.objectCounts.contacts ?? 0;
  const totalCompanies = propertyResults.objectCounts.companies ?? 0;
  const totalOpenDeals = global.dealResults?.totalOpenDeals ?? 0;
  const totalDealPipelines = global.dealResults?.totalPipelines ?? 0;
  const totalWorkflows = global.workflowResults?.totalWorkflows ?? 0;
  const totalUsers = global.userResults?.totalUsers ?? 0;
  const totalTeams = global.userResults?.totalTeams ?? 0;
  const totalLeads = global.leadResults?.totalLeads ?? 0;
  const totalLeadPipelines = global.leadResults?.totalPipelines ?? 0;

  let volumeSection = `## Métriques volumétriques

- Contacts : ${totalContacts}
- Companies : ${totalCompanies}
- Deals ouverts : ${totalOpenDeals}
- Pipelines deals : ${totalDealPipelines}
- Workflows : ${totalWorkflows}
- Utilisateurs : ${totalUsers}
- Équipes : ${totalTeams}`;

  if (totalLeads > 0) {
    volumeSection += `\n- Leads ouverts : ${totalLeads}\n- Pipelines leads : ${totalLeadPipelines}`;
  }

  // Build rules (triggered + compliant)
  const triggered: RuleForPrompt[] = [];
  const compliant: { ruleKey: string; title: string; domain: string }[] = [];

  const addRules = (rules: { key: string; title: string; severity: "critique" | "avertissement" | "info"; domain: string; count: number }[]) => {
    for (const rule of rules) {
      const impact = BUSINESS_IMPACTS[rule.key];
      if (rule.count > 0) {
        triggered.push({
          ruleKey: rule.key,
          title: rule.title,
          severity: rule.severity,
          domain: rule.domain,
          count: rule.count,
          businessImpact: impact?.titre ?? "",
        });
      } else {
        compliant.push({ ruleKey: rule.key, title: rule.title, domain: rule.domain });
      }
    }
  };

  // Property rules
  const r = propertyResults;
  addRules([
    { key: "P1", title: "Propriétés vides depuis plus de 90 jours", severity: "critique", domain: "Propriétés", count: r.p1.length },
    { key: "P2", title: "Propriétés sous-utilisées (fill rate < 5%)", severity: "avertissement", domain: "Propriétés", count: r.p2.length },
    { key: "P3", title: "Doublons de propriétés", severity: "avertissement", domain: "Propriétés", count: r.p3.length },
    { key: "P4", title: "Propriétés sans description", severity: "info", domain: "Propriétés", count: r.p4.length },
    { key: "P5", title: "Propriétés non organisées", severity: "info", domain: "Propriétés", count: r.p5.length },
    { key: "P6", title: "Types de données inadaptés", severity: "avertissement", domain: "Propriétés", count: r.p6.length },
  ]);

  // Contact rules
  const cc = global.contactResults;
  if (cc?.hasContacts) {
    addRules([
      { key: "C-01", title: "Taux contacts avec email", severity: "critique", domain: "Contacts", count: cc.c01.triggered ? 1 : 0 },
      { key: "C-02", title: "Contacts sans prénom ni nom", severity: "critique", domain: "Contacts", count: cc.c02.count },
      { key: "C-03", title: "Taux contacts avec lifecycle stage", severity: "avertissement", domain: "Contacts", count: cc.c03.triggered ? 1 : 0 },
      { key: "C-04a", title: "Deal gagné sans lifecycle customer", severity: "avertissement", domain: "Contacts", count: cc.c04a.count },
      { key: "C-04b", title: "Customers sans deal gagné", severity: "info", domain: "Contacts", count: cc.c04b.count },
      { key: "C-04c", title: "Aucun MQL/SQL avec deals ouverts", severity: "avertissement", domain: "Contacts", count: cc.c04c.triggered ? 1 : 0 },
      { key: "C-04d", title: "Leads précoces avec deal actif", severity: "info", domain: "Contacts", count: cc.c04d.count },
      { key: "C-05", title: "Contacts sans company (B2B)", severity: "info", domain: "Contacts", count: cc.c05 !== null && cc.c05.triggered ? 1 : 0 },
      { key: "C-06", title: "Doublons email exact", severity: "critique", domain: "Contacts", count: cc.c06.length },
      { key: "C-07", title: "Doublons nom+company", severity: "avertissement", domain: "Contacts", count: cc.c07.length },
      { key: "C-08", title: "Doublons téléphone", severity: "avertissement", domain: "Contacts", count: cc.c08.length },
      { key: "C-09", title: "Emails au format invalide", severity: "avertissement", domain: "Contacts", count: cc.c09.length },
      { key: "C-10", title: "Contacts inactifs > 365 jours", severity: "info", domain: "Contacts", count: cc.c10.length },
      { key: "C-11", title: "Contacts sans propriétaire", severity: "info", domain: "Contacts", count: cc.c11.length },
      { key: "C-12", title: "Contacts sans source", severity: "info", domain: "Contacts", count: cc.c12.length },
    ]);
  }

  // Company rules
  const co = global.companyResults;
  if (co?.hasCompanies) {
    addRules([
      { key: "CO-01", title: "Taux companies avec domaine", severity: "critique", domain: "Companies", count: co.co01.triggered ? 1 : 0 },
      { key: "CO-02", title: "Doublons domain exact", severity: "critique", domain: "Companies", count: co.co02.length },
      { key: "CO-03", title: "Doublons nom entreprise", severity: "avertissement", domain: "Companies", count: co.co03.length },
      { key: "CO-04", title: "Companies orphelines (0 contacts > 90j)", severity: "avertissement", domain: "Companies", count: co.co04.length },
      { key: "CO-05", title: "Companies sans propriétaire", severity: "info", domain: "Companies", count: co.co05.length },
      { key: "CO-06", title: "Companies sans industrie", severity: "info", domain: "Companies", count: co.co06.length },
      { key: "CO-07", title: "Companies sans dimensionnement", severity: "info", domain: "Companies", count: co.co07.length },
      { key: "CO-08", title: "Companies inactives > 365j", severity: "info", domain: "Companies", count: co.co08.length },
    ]);
  }

  // Deal rules
  const dd = global.dealResults;
  if (dd?.hasDeals) {
    const d04Count = dd.d04.reduce((s, g) => s + g.deals.length, 0);
    const d05Count = dd.d05.reduce((s, g) => s + g.deals.length, 0);
    addRules([
      { key: "D-01", title: "Taux deals avec montant", severity: "critique", domain: "Deals", count: dd.d01.triggered ? 1 : 0 },
      { key: "D-02", title: "Taux deals avec date de clôture", severity: "critique", domain: "Deals", count: dd.d02.triggered ? 1 : 0 },
      { key: "D-03", title: "Deals ouverts > 60 jours", severity: "avertissement", domain: "Deals", count: dd.d03.length },
      { key: "D-04", title: "Propriétés obligatoires manquantes", severity: "critique", domain: "Deals", count: d04Count },
      { key: "D-05", title: "Deals bloqués dans un stage", severity: "avertissement", domain: "Deals", count: d05Count },
      { key: "D-06", title: "Pipelines sans activité", severity: "info", domain: "Deals", count: dd.d06.length },
      { key: "D-07", title: "Pipelines trop de stages (> 8)", severity: "info", domain: "Deals", count: dd.d07.length },
      { key: "D-08", title: "Deals sans propriétaire", severity: "info", domain: "Deals", count: dd.d08.length },
      { key: "D-09", title: "Deals sans contact associé", severity: "avertissement", domain: "Deals", count: dd.d09.length },
      { key: "D-10", title: "Deals sans company associée", severity: "info", domain: "Deals", count: !dd.d10.disabled ? dd.d10.deals.length : 0 },
      { key: "D-11", title: "Deals avec montant à 0", severity: "avertissement", domain: "Deals", count: dd.d11.length },
      { key: "D-12", title: "Phases fréquemment sautées", severity: "avertissement", domain: "Deals", count: dd.d12.length },
      { key: "D-13", title: "Points d'entrée multiples", severity: "avertissement", domain: "Deals", count: dd.d13.length },
      { key: "D-14", title: "Stages fermés redondants", severity: "avertissement", domain: "Deals", count: dd.d14.length },
      { key: "D-15", title: "Stages sans activité 90j", severity: "info", domain: "Deals", count: dd.d15.length },
    ]);
  }

  // Workflow rules
  const ww = global.workflowResults;
  if (ww?.hasWorkflows) {
    addRules([
      { key: "W1", title: "Workflows actifs taux erreur > 10%", severity: "critique", domain: "Workflows", count: ww.w1.length },
      { key: "W2", title: "Workflows actifs sans actions", severity: "critique", domain: "Workflows", count: ww.w2.length },
      { key: "W3", title: "Workflows actifs sans enrôlement > 90j", severity: "avertissement", domain: "Workflows", count: ww.w3.length },
      { key: "W4", title: "Workflows inactifs > 90 jours", severity: "avertissement", domain: "Workflows", count: ww.w4.length },
      { key: "W5", title: "Workflows récemment désactivés", severity: "info", domain: "Workflows", count: ww.w5.length },
      { key: "W6", title: "Workflows noms non descriptifs", severity: "info", domain: "Workflows", count: ww.w6.length },
      { key: "W7", title: "Workflows sans dossier", severity: "info", domain: "Workflows", count: ww.w7.length },
    ]);
  }

  // User rules
  const uu = global.userResults;
  if (uu?.hasUsers && !uu.scopeError) {
    addRules([
      { key: "U-01", title: "Utilisateurs sans équipe", severity: "avertissement", domain: "Utilisateurs", count: uu.u01.length },
      { key: "U-02", title: "Super Admins en excès", severity: "critique", domain: "Utilisateurs", count: uu.u02.triggered ? uu.u02.superAdminCount : 0 },
      { key: "U-03", title: "Utilisateurs sans rôle", severity: "avertissement", domain: "Utilisateurs", count: uu.u03.length },
      { key: "U-04", title: "Rôles non différenciés", severity: "avertissement", domain: "Utilisateurs", count: uu.u04.triggered ? 1 : 0 },
      { key: "U-05", title: "Utilisateurs inactifs", severity: "critique", domain: "Utilisateurs", count: uu.u05.inactiveUsers.length },
      { key: "U-06", title: "Équipes vides", severity: "info", domain: "Utilisateurs", count: uu.u06.length },
      { key: "U-07", title: "Owners sans objet CRM", severity: "info", domain: "Utilisateurs", count: uu.u07.length },
    ]);
  }

  // Lead rules
  const ll = global.leadResults;
  if (ll?.hasLeads && !ll.scopeError) {
    const l02Count = ll.l02.reduce((s, g) => s + g.leads.length, 0);
    addRules([
      { key: "L-01", title: "Leads ouverts > 30 jours", severity: "avertissement", domain: "Leads", count: ll.l01.length },
      { key: "L-02", title: "Leads bloqués dans un stage", severity: "avertissement", domain: "Leads", count: l02Count },
      { key: "L-03", title: "Leads sans propriétaire", severity: "info", domain: "Leads", count: ll.l03.length },
      { key: "L-04", title: "Leads sans contact associé", severity: "critique", domain: "Leads", count: ll.l04.length },
      { key: "L-05", title: "Pipelines prospection sans activité", severity: "info", domain: "Leads", count: ll.l05.length },
      { key: "L-06", title: "Pipelines prospection trop de stages", severity: "info", domain: "Leads", count: ll.l06.length },
      { key: "L-07", title: "Phases fréquemment sautées (leads)", severity: "avertissement", domain: "Leads", count: ll.l07.length },
      { key: "L-08", title: "Points d'entrée multiples (leads)", severity: "avertissement", domain: "Leads", count: ll.l08.length },
      { key: "L-09", title: "Stages fermés redondants (leads)", severity: "avertissement", domain: "Leads", count: ll.l09.length },
      { key: "L-10", title: "Stages sans activité 60j (leads)", severity: "info", domain: "Leads", count: ll.l10.length },
      { key: "L-11", title: "Leads disqualifiés sans motif", severity: "avertissement", domain: "Leads", count: ll.l11.triggered ? ll.l11.withoutReason : 0 },
      { key: "L-12", title: "Motif disqualification non structuré", severity: "info", domain: "Leads", count: ll.l12.triggered && !ll.l12.disabled ? 1 : 0 },
      { key: "L-13", title: "Leads qualifiés sans deal", severity: "critique", domain: "Leads", count: ll.l13.triggered ? ll.l13.withoutDeal : 0 },
      { key: "L-14", title: "Leads sans source", severity: "avertissement", domain: "Leads", count: ll.l14.length },
    ]);
  }

  // Sort triggered rules: severity desc (critique > avertissement > info), then count desc
  const severityOrder: Record<string, number> = { critique: 0, avertissement: 1, info: 2 };
  triggered.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.count - a.count;
  });

  const triggeredLines = triggered.map(
    (r) => `- [${r.severity}] ${r.ruleKey} — ${r.title} (${r.count} occurrences, domaine: ${r.domain})\n  Impact business : ${r.businessImpact}`
  ).join("\n");

  const compliantLines = compliant.map(
    (r) => `- ${r.ruleKey} — ${r.title} (domaine: ${r.domain})`
  ).join("\n");

  return `Voici les résultats de l'audit HubSpot à analyser.

## Score global

- Score : ${globalScore}/100 — ${globalScoreLabel}
- Niveau de maturité estimé : ${getMaturityLevel(globalScore)}

## Scores par domaine

${domainScores.join("\n")}
${excludedSection}
${volumeSection}

## Règles déclenchées (problèmes détectés)

${triggeredLines || "Aucune règle déclenchée."}

## Règles conformes (aucun problème détecté)

${compliantLines || "Aucune règle conforme."}

Produis le diagnostic structuré, le hero summary et la roadmap de recommandations selon le format JSON demandé.`;
}

// ─── Main generation function ───────────────────────────────────────────

export async function generateDiagnosticIA(
  global: GlobalAuditResults,
  selectedDomains?: string[],
  auditDomains?: AuditDomainSelection | null,
): Promise<AIDiagnostic | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-5.4";

  try {
    const knowledgeBase = loadKnowledgeBase();
    const systemPrompt = buildSystemPrompt(knowledgeBase);
    const userPrompt = buildUserPrompt({ global, selectedDomains, auditDomains });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120_000 });

    const response = await client.responses.create({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: diagnosticJsonSchema.name,
          strict: diagnosticJsonSchema.strict,
          schema: diagnosticJsonSchema.schema,
        },
      },
      temperature: 0.3,
    });

    const text = response.output_text;
    if (!text) return null;

    const parsed: AIDiagnostic = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("[Diagnostic IA] Erreur:", error);
    // Fallback silencieux — ne jamais bloquer l'affichage du rapport
    return null;
  }
}
