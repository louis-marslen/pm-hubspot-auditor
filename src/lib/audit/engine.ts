import { HubSpotClient } from "@/lib/hubspot/api-client";
import { AuditResults, WorkflowAuditResults, GlobalAuditResults, AuditProgress, AuditDomainId } from "@/lib/audit/types";
import { runWorkflowRules } from "@/lib/audit/rules/workflows";
import { runContactAudit } from "@/lib/audit/contact-engine";
import { runCompanyAudit } from "@/lib/audit/company-engine";
import { runUserAudit } from "@/lib/audit/user-engine";
import { runDealAudit } from "@/lib/audit/deal-engine";
import { calculateGlobalScore } from "@/lib/audit/global-score";
import {
  initProgress,
  updateDomainStep,
  completeDomain,
  failDomain,
  persistProgress,
} from "@/lib/audit/progress";
import {
  getCustomProperties,
  computeFillRates,
  runP1,
  runP2,
  runP3,
  runP4,
  runP5,
  runP6,
} from "@/lib/audit/rules/custom-properties";
import {
  countTotal,
  runP13,
  runP14,
  runP15,
  runP16,
} from "@/lib/audit/rules/system-properties";
import { calculateScore } from "@/lib/audit/score";

const OBJECT_TYPES = ["contacts", "companies", "deals"] as const;

/**
 * Orchestrateur principal de l'audit.
 * Appelle toutes les règles P1-P16 et retourne les résultats consolidés.
 */
export async function runAudit(accessToken: string): Promise<AuditResults> {
  const client = new HubSpotClient(accessToken);
  const t = (label: string, since: number) => console.log(`[audit] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. Comptes totaux en parallèle
  const [totalContacts, totalCompanies, totalDeals] = await Promise.all([
    countTotal(client, "contacts"),
    countTotal(client, "companies"),
    countTotal(client, "deals"),
  ]);
  t("counts", t0);

  const objectCounts = {
    contacts: totalContacts,
    companies: totalCompanies,
    deals: totalDeals,
  };

  // 2. Propriétés custom pour chaque type d'objet
  const [contactsProps, companiesProps, dealsProps] = await Promise.all([
    getCustomProperties(client, "contacts"),
    getCustomProperties(client, "companies"),
    getCustomProperties(client, "deals"),
  ]);
  t("custom props", t0);

  const customPropertyCounts = {
    contacts: contactsProps.length,
    companies: companiesProps.length,
    deals: dealsProps.length,
  };

  // 3. Fill rates séquentiels par type d'objet pour éviter de dépasser la limite secondaire HubSpot.
  // Optimisation : seules les propriétés > 90j sont pertinentes (P1/P2 ignorent les autres).
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const contactsPropsOld = contactsProps.filter((p) => new Date(p.createdAt).getTime() < ninetyDaysAgo);
  const companiesPropsOld = companiesProps.filter((p) => new Date(p.createdAt).getTime() < ninetyDaysAgo);
  const dealsPropsOld = dealsProps.filter((p) => new Date(p.createdAt).getTime() < ninetyDaysAgo);

  // Plafond de 30 props par type : suffisant pour détecter P1/P2, évite les audits > 30s
  // Les props sont triées par ancienneté (les plus vieilles d'abord = plus susceptibles d'être vides)
  const sortByAge = (a: { createdAt: string }, b: { createdAt: string }) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const MAX_FILL_RATE_PROPS = 30;
  const contactsPropsForRates = contactsPropsOld.sort(sortByAge).slice(0, MAX_FILL_RATE_PROPS);
  const companiesPropsForRates = companiesPropsOld.sort(sortByAge).slice(0, MAX_FILL_RATE_PROPS);
  const dealsPropsForRates = dealsPropsOld.sort(sortByAge).slice(0, MAX_FILL_RATE_PROPS);

  console.log(`[audit] fill rates: contacts=${contactsPropsForRates.length}, companies=${companiesPropsForRates.length}, deals=${dealsPropsForRates.length} props à analyser`);
  const contactsFillRates = await computeFillRates(client, "contacts", contactsPropsForRates, totalContacts);
  t("fill rates contacts", t0);
  const companiesFillRates = await computeFillRates(client, "companies", companiesPropsForRates, totalCompanies);
  t("fill rates companies", t0);
  const dealsFillRates = await computeFillRates(client, "deals", dealsPropsForRates, totalDeals);
  t("fill rates deals", t0);

  // 4. Règles P1-P6 sur les propriétés custom
  const p1 = [
    ...runP1(contactsProps, contactsFillRates, "contacts"),
    ...runP1(companiesProps, companiesFillRates, "companies"),
    ...runP1(dealsProps, dealsFillRates, "deals"),
  ];

  const p2 = [
    ...runP2(contactsProps, contactsFillRates, totalContacts, "contacts"),
    ...runP2(companiesProps, companiesFillRates, totalCompanies, "companies"),
    ...runP2(dealsProps, dealsFillRates, totalDeals, "deals"),
  ];

  const p3 = [
    ...runP3(contactsProps, "contacts"),
    ...runP3(companiesProps, "companies"),
    ...runP3(dealsProps, "deals"),
  ];

  const p4 = [
    ...runP4(contactsProps, "contacts"),
    ...runP4(companiesProps, "companies"),
    ...runP4(dealsProps, "deals"),
  ];

  const p5 = [
    ...runP5(contactsProps, "contacts"),
    ...runP5(companiesProps, "companies"),
    ...runP5(dealsProps, "deals"),
  ];

  const p6 = [
    ...runP6(contactsProps, "contacts"),
    ...runP6(companiesProps, "companies"),
    ...runP6(dealsProps, "deals"),
  ];

  // Deals ouverts : nécessaire pour P13/P14
  // On utilise le total deals comme proxy (MVP : pas de filtre open/closed supplémentaire)
  const totalDealsOpen = totalDeals;

  // 5. Règles système (P7-P11 migrées vers contacts EP-05, P12 migrée vers companies EP-05b)
  const [p13, p14] = await Promise.all([
    runP13(client, totalDealsOpen),
    runP14(client, totalDealsOpen),
  ]);
  const p15 = await runP15(client);
  t("p15", t0);
  const p16 = await runP16(client);
  t("p16 / system rules done", t0);

  // 6. Calcul du score
  const partialResults = {
    objectCounts,
    customPropertyCounts,
    p1, p2, p3, p4, p5, p6,
    p13, p14, p15, p16,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateScore(partialResults as AuditResults);

  return {
    ...partialResults,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}

/**
 * Audit des workflows uniquement.
 */
export async function runWorkflowAudit(accessToken: string): Promise<WorkflowAuditResults> {
  return runWorkflowRules(accessToken);
}

/**
 * Audit complet : propriétés + workflows en parallèle → score global.
 * runAudit() reste intacte pour rétrocompatibilité.
 *
 * Quand auditId est fourni, émet la progression domaine par domaine
 * et la persiste en base pour le polling frontend.
 */
export async function runFullAudit(
  accessToken: string,
  auditId?: string,
  selectedDomains?: AuditDomainId[],
): Promise<GlobalAuditResults> {
  // Domaines dans l'ordre d'affichage du tracker
  // Si selectedDomains est fourni, filtrer ; sinon tous les domaines
  const ALL_DOMAIN_KEYS = ["properties", "contacts", "companies", "deals", "workflows", "users"];
  const DOMAIN_KEYS = selectedDomains
    ? ALL_DOMAIN_KEYS.filter((d) => selectedDomains.includes(d as AuditDomainId))
    : ALL_DOMAIN_KEYS;

  let progress: AuditProgress | null = auditId
    ? initProgress(DOMAIN_KEYS)
    : null;

  // Helper : met à jour et persiste la progression (no-op si pas de tracking)
  async function emit(updater: (p: AuditProgress) => AuditProgress) {
    if (!progress || !auditId) return;
    progress = updater(progress);
    await persistProgress(auditId, progress);
  }

  // ── Propriétés ──────────────────────────────────────────────────────────
  let propertyResults: AuditResults;
  try {
    await emit((p) => updateDomainStep(p, "properties", "fetching"));
    // runAudit fait tout en interne (fetch + analyse + score)
    // On émet les étapes intermédiaires au mieux
    propertyResults = await runAudit(accessToken);
    await emit((p) => completeDomain(p, "properties"));
  } catch (err) {
    await emit((p) => failDomain(p, "properties", err instanceof Error ? err.message : "Erreur inconnue"));
    throw err;
  }

  // ── Domaines parallèles (workflows, contacts, companies, users) ─────────
  // Après Properties, les 4 autres domaines sont indépendants.
  // On les lance en parallèle pour réduire le temps total d'audit.
  const totalContacts = propertyResults.objectCounts.contacts ?? 0;
  const totalCompanies = propertyResults.objectCounts.companies ?? 0;

  // Workflow task
  async function runWorkflowsTask(): Promise<WorkflowAuditResults | null> {
    try {
      await emit((p) => updateDomainStep(p, "workflows", "fetching"));
      const results = await runWorkflowAudit(accessToken);
      await emit((p) => completeDomain(p, "workflows"));
      return results;
    } catch (err) {
      await emit((p) => failDomain(p, "workflows", err instanceof Error ? err.message : "Erreur inconnue"));
      return null;
    }
  }

  // Contacts task
  async function runContactsTask() {
    if (totalContacts === 0) {
      await emit((p) => {
        const updated = updateDomainStep(p, "contacts", "fetching", 0);
        return completeDomain(updated, "contacts");
      });
      return null;
    }
    try {
      await emit((p) => updateDomainStep(p, "contacts", "fetching", totalContacts));
      const results = await runContactAudit(accessToken, totalContacts, totalCompanies);
      await emit((p) => completeDomain(p, "contacts"));
      return results;
    } catch (err) {
      await emit((p) => failDomain(p, "contacts", err instanceof Error ? err.message : "Erreur inconnue"));
      return null;
    }
  }

  // Companies task
  async function runCompaniesTask() {
    if (totalCompanies === 0) {
      await emit((p) => {
        const updated = updateDomainStep(p, "companies", "fetching", 0);
        return completeDomain(updated, "companies");
      });
      return null;
    }
    try {
      await emit((p) => updateDomainStep(p, "companies", "fetching", totalCompanies));
      const results = await runCompanyAudit(accessToken, totalCompanies);
      await emit((p) => completeDomain(p, "companies"));
      return results;
    } catch (err) {
      await emit((p) => failDomain(p, "companies", err instanceof Error ? err.message : "Erreur inconnue"));
      return null;
    }
  }

  // Deals task
  const totalDeals = propertyResults.objectCounts.deals ?? 0;
  async function runDealsTask(): Promise<Awaited<ReturnType<typeof runDealAudit>>> {
    if (totalDeals === 0) {
      await emit((p) => {
        const updated = updateDomainStep(p, "deals", "fetching", 0);
        return completeDomain(updated, "deals");
      });
      return null;
    }
    try {
      await emit((p) => updateDomainStep(p, "deals", "fetching", totalDeals));
      const results = await runDealAudit(accessToken, totalDeals, totalCompanies);
      await emit((p) => completeDomain(p, "deals"));
      return results;
    } catch (err) {
      await emit((p) => failDomain(p, "deals", err instanceof Error ? err.message : "Erreur inconnue"));
      return null;
    }
  }

  // Users task
  async function runUsersTask(): Promise<Awaited<ReturnType<typeof runUserAudit>>> {
    try {
      await emit((p) => updateDomainStep(p, "users", "fetching"));
      const results = await runUserAudit(accessToken);
      if (results === null) {
        await emit((p) => {
          const updated = updateDomainStep(p, "users", "fetching", 0);
          return completeDomain(updated, "users");
        });
        return null;
      }
      await emit((p) => updateDomainStep(p, "users", "analyzing", results.totalUsers));
      await emit((p) => updateDomainStep(p, "users", "scoring"));
      await emit((p) => completeDomain(p, "users"));
      return results;
    } catch (err) {
      await emit((p) => failDomain(p, "users", err instanceof Error ? err.message : "Erreur inconnue"));
      return null;
    }
  }

  // Lancement parallèle des domaines sélectionnés
  const shouldRun = (domain: string) => DOMAIN_KEYS.includes(domain);

  const [workflowResults, contactResults, companyResults, dealResults, userResults] = await Promise.all([
    shouldRun("workflows") ? runWorkflowsTask() : Promise.resolve(null),
    shouldRun("contacts") ? runContactsTask() : Promise.resolve(null),
    shouldRun("companies") ? runCompaniesTask() : Promise.resolve(null),
    shouldRun("deals") ? runDealsTask() : Promise.resolve(null),
    shouldRun("users") ? runUsersTask() : Promise.resolve(null),
  ]);

  return calculateGlobalScore(propertyResults, workflowResults, contactResults, companyResults, userResults, dealResults);
}
