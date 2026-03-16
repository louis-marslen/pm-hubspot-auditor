import { DealAuditResults } from "@/lib/audit/types";

interface DealScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Deals" selon la formule PRD EP-06 section 6.7.
 *
 * Comptage (section 6.6) :
 * - D-01, D-02 : 1 problème unique si seuil franchi (critique)
 * - D-03 : 1 par deal (avertissement)
 * - D-04 : 1 par deal concerné (critique)
 * - D-05 : 1 par deal bloqué (avertissement)
 * - D-06 : 1 par pipeline (info)
 * - D-07 : 1 par pipeline (info)
 * - D-08 : 1 par deal (info)
 * - D-09 : 1 par deal (avertissement)
 * - D-10 : 1 par deal (info)
 * - D-11 : 1 par deal (avertissement)
 * - D-12 : 1 par pipeline (avertissement)
 * - D-13 : 1 par pipeline (avertissement)
 * - D-14 : 1 par pipeline (avertissement)
 * - D-15 : 1 par stage (info)
 */
export function calculateDealScore(results: DealAuditResults): DealScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // D-01 : taux montant — critique (1 si déclenché)
  if (results.d01.triggered) critiques += 1;
  // D-02 : taux date clôture — critique (1 si déclenché)
  if (results.d02.triggered) critiques += 1;
  // D-03 : deal ancien — avertissement (1 par deal)
  avertissements += results.d03.length;
  // D-04 : propriétés obligatoires — critique (1 par deal)
  critiques += results.d04.reduce((sum, group) => sum + group.deals.length, 0);

  // D-05 : deals bloqués — avertissement (1 par deal)
  avertissements += results.d05.reduce((sum, group) => sum + group.deals.length, 0);

  // D-06 : pipeline sans activité — info (1 par pipeline)
  infos += results.d06.filter((r) => r.triggered).length;
  // D-07 : pipeline trop de stages — info (1 par pipeline)
  infos += results.d07.filter((r) => r.triggered).length;

  // D-08 : sans owner — info (1 par deal)
  infos += results.d08.length;
  // D-09 : sans contact — avertissement (1 par deal)
  avertissements += results.d09.length;
  // D-10 : sans company — info (1 par deal)
  if (!results.d10.disabled) infos += results.d10.deals.length;
  // D-11 : montant à 0 — avertissement (1 par deal)
  avertissements += results.d11.length;

  // D-12 : phases sautées — avertissement (1 par pipeline)
  avertissements += results.d12.filter((r) => r.triggered).length;
  // D-13 : points d'entrée multiples — avertissement (1 par pipeline)
  avertissements += results.d13.filter((r) => r.triggered).length;
  // D-14 : stages fermés redondants — avertissement (1 par pipeline)
  avertissements += results.d14.filter((r) => r.triggered).length;
  // D-15 : stage sans activité — info (1 par stage)
  infos += results.d15.length;

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
