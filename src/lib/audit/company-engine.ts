import { HubSpotClient } from "@/lib/hubspot/api-client";
import { CompanyAuditResults } from "@/lib/audit/types";
import { calculateCompanyScore } from "@/lib/audit/company-score";
import {
  runCO01, runCO02, runCO03, runCO04, runCO05, runCO06, runCO07, runCO08,
  fetchAllCompanies, enrichCompaniesWithAssociations,
} from "@/lib/audit/rules/companies";

/**
 * Orchestrateur du domaine Companies (EP-05b).
 * Récupère les companies, exécute CO-01 à CO-08, calcule le score.
 */
export async function runCompanyAudit(
  accessToken: string,
  totalCompanies: number,
  onFetchProgress?: (fetchedCount: number) => void,
  onStep?: (step: "fetching" | "analyzing" | "scoring") => void,
): Promise<CompanyAuditResults | null> {
  if (totalCompanies === 0) return null;

  const client = new HubSpotClient(accessToken);
  const t = (label: string, since: number) => console.log(`[audit:companies] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. CO-01 (taux domain) — requête API comptage
  const co01 = await runCO01(client, totalCompanies);
  t("co01", t0);

  // 2. Récupération de toutes les companies
  const allCompanies = await fetchAllCompanies(client, onFetchProgress);
  t(`fetch all companies (${allCompanies.length})`, t0);

  // 3. Enrichir avec les associations contacts + deals
  onStep?.("analyzing");
  await enrichCompaniesWithAssociations(client, allCompanies);
  t("enrich associations", t0);

  // 4. Règles doublons (locales)
  const co02 = runCO02(allCompanies);
  const co03 = runCO03(allCompanies);
  t("co02-co03 duplicates", t0);

  // 5. Règles qualité (locales)
  const co04 = runCO04(allCompanies);
  const co05 = runCO05(allCompanies);
  const co06 = runCO06(allCompanies);
  const co07 = runCO07(allCompanies);
  const co08 = runCO08(allCompanies);
  t("co04-co08 quality", t0);

  // 6. Calcul du score
  onStep?.("scoring");
  const partialResults: CompanyAuditResults = {
    totalCompanies,
    hasCompanies: true,
    co01, co02, co03, co04, co05, co06, co07, co08,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateCompanyScore(partialResults);
  t("score calculated", t0);

  return {
    ...partialResults,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
