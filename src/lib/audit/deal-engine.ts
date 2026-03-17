import { HubSpotClient } from "@/lib/hubspot/api-client";
import { DealAuditResults } from "@/lib/audit/types";
import { calculateDealScore } from "@/lib/audit/deal-score";
import {
  fetchPipelines,
  fetchOpenDeals,
  runD01, runD02, runD03, runD04, runD05,
  runD08, runD09, runD10, runD11,
} from "@/lib/audit/rules/deals";
import {
  runD06, runD07, runD12, runD13, runD14, runD15,
} from "@/lib/audit/rules/pipelines";

/**
 * Orchestrateur du domaine Deals & Pipelines (EP-06).
 * Récupère les deals et pipelines, exécute D-01 à D-15, calcule le score.
 */
export async function runDealAudit(
  accessToken: string,
  totalDeals: number,
  totalCompanies: number,
  onFetchProgress?: (fetchedCount: number) => void,
  onStep?: (step: "fetching" | "analyzing" | "scoring") => void,
): Promise<DealAuditResults | null> {
  if (totalDeals === 0) return null;

  const client = new HubSpotClient(accessToken);
  const t = (label: string, since: number) => console.log(`[audit:deals] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. Fetch pipelines & stages configuration
  const pipelines = await fetchPipelines(client);
  t("pipelines", t0);

  // 2. Fetch all open deals with hs_date_entered_* properties
  const openDeals = await fetchOpenDeals(client, pipelines, onFetchProgress);
  t(`open deals (${openDeals.length})`, t0);

  const totalOpenDeals = openDeals.length;

  // 3. Run migrated rules (D-01 to D-04) — local computation
  onStep?.("analyzing");
  const d01 = runD01(openDeals);
  const d02 = runD02(openDeals);
  const d03 = runD03(openDeals);
  const d04 = runD04(openDeals, pipelines);
  t("d01-d04", t0);

  // 4. Run D-05 blocked deals
  const d05 = runD05(openDeals, pipelines);
  t("d05", t0);

  // 5. Run pipeline rules (D-06, D-07, D-12-D-15) — local computation
  const d06 = runD06(pipelines, openDeals, totalDeals);
  const d07 = runD07(pipelines, openDeals);
  const d12 = runD12(pipelines, openDeals);
  const d13 = runD13(pipelines, openDeals);
  const d14 = runD14(pipelines, openDeals);

  // D-15 needs inactive pipeline IDs from D-06
  const inactivePipelineIds = new Set(d06.map((r) => r.pipelineId));
  const d15 = runD15(pipelines, openDeals, inactivePipelineIds);
  t("d06-d15", t0);

  // 6. Run quality rules requiring API calls (D-09, D-10)
  const d08 = runD08(openDeals);
  const [d09, d10] = await Promise.all([
    runD09(client, openDeals),
    runD10(client, openDeals, totalCompanies),
  ]);
  const d11 = runD11(openDeals);
  t("d08-d11", t0);

  // 7. Calculate score
  onStep?.("scoring");
  const partial: DealAuditResults = {
    totalDeals,
    totalOpenDeals,
    totalPipelines: pipelines.length,
    hasDeals: true,
    d01, d02, d03, d04, d05,
    d06, d07, d12, d13, d14, d15,
    d08, d09, d10, d11,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateDealScore(partial);

  return {
    ...partial,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
