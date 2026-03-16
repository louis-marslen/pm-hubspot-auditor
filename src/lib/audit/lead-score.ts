import { LeadAuditResults } from "@/lib/audit/types";

interface LeadScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Leads" selon la formule PRD EP-18 section 6.6.
 *
 * Comptage (section 6.5) :
 * - L-01 : 1 par lead (avertissement)
 * - L-02 : 1 par lead bloqué (avertissement)
 * - L-03 : 1 par lead (info)
 * - L-04 : 1 par lead (critique)
 * - L-05 : 1 par pipeline (info)
 * - L-06 : 1 par pipeline (info)
 * - L-07 : 1 par pipeline (avertissement)
 * - L-08 : 1 par pipeline (avertissement)
 * - L-09 : 1 par pipeline (avertissement)
 * - L-10 : 1 par stage (info)
 * - L-11 : 1 par lead disqualifié sans motif (avertissement)
 * - L-12 : 1 unique si déclenché (info)
 * - L-13 : 1 par lead qualifié sans deal (critique)
 * - L-14 : 1 par lead (avertissement)
 */
export function calculateLeadScore(results: LeadAuditResults): LeadScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // L-01 : lead ancien — avertissement (1 par lead)
  avertissements += results.l01.length;
  // L-02 : lead bloqué — avertissement (1 par lead)
  avertissements += results.l02.reduce((sum, group) => sum + group.leads.length, 0);
  // L-03 : sans owner — info (1 par lead)
  infos += results.l03.length;
  // L-04 : sans contact — critique (1 par lead)
  critiques += results.l04.length;

  // L-05 : pipeline sans activité — info (1 par pipeline)
  infos += results.l05.filter((r) => r.triggered).length;
  // L-06 : pipeline trop de stages — info (1 par pipeline)
  infos += results.l06.filter((r) => r.triggered).length;
  // L-07 : phases sautées — avertissement (1 par pipeline)
  avertissements += results.l07.filter((r) => r.triggered).length;
  // L-08 : points d'entrée multiples — avertissement (1 par pipeline)
  avertissements += results.l08.filter((r) => r.triggered).length;
  // L-09 : stages fermés redondants — avertissement (1 par pipeline)
  avertissements += results.l09.filter((r) => r.triggered).length;
  // L-10 : stage sans activité — info (1 par stage)
  infos += results.l10.length;

  // L-11 : disqualifié sans motif — avertissement (1 par lead)
  avertissements += results.l11.withoutReason;
  // L-12 : motif non structuré — info (1 unique)
  if (results.l12.triggered) infos += 1;
  // L-13 : qualifié sans deal — critique (1 par lead)
  critiques += results.l13.withoutDeal;
  // L-14 : sans source — avertissement (1 par lead)
  avertissements += results.l14.length;

  const deductionCritiques = Math.min(critiques * 5, 30);
  const deductionAvertissements = Math.min(avertissements * 2, 15);
  const deductionInfos = Math.min(infos * 0.5, 5);

  const score = Math.max(0, Math.round(100 - deductionCritiques - deductionAvertissements - deductionInfos));

  let label: string;
  if (score <= 49) label = "Critique";
  else if (score <= 69) label = "À améliorer";
  else if (score <= 89) label = "Bon";
  else label = "Excellent";

  return { score, label, critiques, avertissements, infos };
}
