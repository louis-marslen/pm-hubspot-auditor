import { HubSpotClient } from "@/lib/hubspot/api-client";
import { LeadAuditResults } from "@/lib/audit/types";
import { calculateLeadScore } from "@/lib/audit/lead-score";
import {
  fetchLeadPipelines,
  fetchOpenLeads,
  fetchLeadsInStages,
  fetchLeadProperties,
  countTotalLeads,
  runL01, runL02, runL03, runL04,
  runL11, runL12, runL13, runL14,
  enrichLeadLabels,
} from "@/lib/audit/rules/leads";
import {
  runL05, runL06, runL07, runL08, runL09, runL10,
  getStageIdsByType,
} from "@/lib/audit/rules/lead-pipelines";

/**
 * Orchestrateur du domaine Leads & Pipelines de prospection (EP-18).
 * Récupère les leads et pipelines, exécute L-01 à L-14, calcule le score.
 *
 * Retourne null si 0 lead dans le workspace.
 * Retourne un résultat avec scopeError si le scope crm.objects.leads.read est manquant.
 */
export async function runLeadAudit(
  accessToken: string,
  onFetchProgress?: (fetchedCount: number) => void,
  onTotalKnown?: (total: number) => void,
  onStep?: (step: "fetching" | "analyzing" | "scoring") => void,
): Promise<LeadAuditResults | null> {
  const client = new HubSpotClient(accessToken);
  const t = (label: string, since: number) => console.log(`[audit:leads] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. Check if leads API is accessible (scope check)
  let totalLeads: number;
  try {
    totalLeads = await countTotalLeads(client);
    console.log(`[audit:leads] countTotalLeads returned: ${totalLeads}`);
  } catch (err: unknown) {
    console.error(`[audit:leads] countTotalLeads error:`, err);
    const status = (err as { status?: number })?.status;
    const message = err instanceof Error ? err.message : String(err);

    if (status === 403 || message.includes("403") || message.toLowerCase().includes("forbidden")) {
      return {
        totalLeads: 0,
        totalOpenLeads: 0,
        totalPipelines: 0,
        hasLeads: false,
        l01: [], l02: [], l03: [], l04: [],
        l05: [], l06: [], l07: [], l08: [], l09: [], l10: [],
        l11: { triggered: false, totalDisqualified: 0, withoutReason: 0, rate: 0, leads: [] },
        l12: { triggered: false, disabled: true, disabledReason: null, propertyName: null, propertyType: null },
        l13: { triggered: false, totalQualified: 0, withoutDeal: 0, rate: 0, leads: [] },
        l14: [],
        score: 0,
        scoreLabel: "Critique",
        totalCritiques: 0,
        totalAvertissements: 0,
        totalInfos: 0,
        scopeError: "L'accès aux leads nécessite le scope crm.objects.leads.read. Reconnectez votre compte HubSpot avec les permissions nécessaires.",
      };
    }
    throw err;
  }
  t("count total leads", t0);
  onTotalKnown?.(totalLeads);

  if (totalLeads === 0) return null;

  // 2. Fetch pipelines & stages
  const pipelines = await fetchLeadPipelines(client);
  t("pipelines", t0);

  // 3. Fetch all open leads with hs_date_entered_* properties
  const openLeads = await fetchOpenLeads(client, pipelines, onFetchProgress);
  t(`open leads (${openLeads.length})`, t0);

  const totalOpenLeads = openLeads.length;

  // 4. Fetch lead properties schema (for L-12)
  onStep?.("analyzing");
  const leadProperties = await fetchLeadProperties(client);
  t("lead properties schema", t0);

  // 5. Run rules on open leads (L-01 to L-04, L-14)
  const l01 = enrichLeadLabels(runL01(openLeads), pipelines);
  const l02 = runL02(openLeads, pipelines);
  const l03 = enrichLeadLabels(runL03(openLeads), pipelines);
  const l04Promise = runL04(client, openLeads);
  const l14 = enrichLeadLabels(runL14(openLeads), pipelines);
  t("l01-l03, l14", t0);

  // 6. Run pipeline rules (L-05 to L-10)
  const l05 = runL05(pipelines, openLeads);
  const l06 = runL06(pipelines, openLeads);
  const l07 = runL07(pipelines, openLeads);
  const l08 = runL08(pipelines, openLeads);
  const l09 = runL09(pipelines, openLeads);

  const inactivePipelineIds = new Set(l05.map((r) => r.pipelineId));
  const l10 = runL10(pipelines, openLeads, inactivePipelineIds);
  t("l05-l10", t0);

  // 7. Fetch leads in special stages for L-11, L-13
  const disqualifiedStageIds = getStageIdsByType(pipelines, "disqualified");
  const qualifiedStageIds = getStageIdsByType(pipelines, "qualified");

  const [disqualifiedLeads, qualifiedLeads] = await Promise.all([
    disqualifiedStageIds.length > 0 ? fetchLeadsInStages(client, disqualifiedStageIds, pipelines) : Promise.resolve([]),
    qualifiedStageIds.length > 0 ? fetchLeadsInStages(client, qualifiedStageIds, pipelines) : Promise.resolve([]),
  ]);
  t(`disqualified (${disqualifiedLeads.length}), qualified (${qualifiedLeads.length})`, t0);

  // 8. Run L-11, L-12, L-13
  const l11 = runL11(disqualifiedLeads);
  l11.leads = enrichLeadLabels(l11.leads, pipelines);
  const l12 = runL12(leadProperties);
  const l13Promise = runL13(client, qualifiedLeads);

  // 9. Await async rules
  const [l04, l13] = await Promise.all([l04Promise, l13Promise]);
  const l04Enriched = enrichLeadLabels(l04, pipelines);
  l13.leads = enrichLeadLabels(l13.leads, pipelines);
  t("l04, l11-l13", t0);

  // 10. Calculate score
  onStep?.("scoring");
  const partial: LeadAuditResults = {
    totalLeads,
    totalOpenLeads,
    totalPipelines: pipelines.length,
    hasLeads: true,
    l01, l02, l03, l04: l04Enriched,
    l05, l06, l07, l08, l09, l10,
    l11, l12, l13, l14,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
  };

  const { score, label, critiques, avertissements, infos } = calculateLeadScore(partial);

  return {
    ...partial,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
