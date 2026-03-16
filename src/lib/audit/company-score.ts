import { CompanyAuditResults } from "@/lib/audit/types";

interface CompanyScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Companies" selon la formule PRD EP-05b section 6.6.
 *
 * Déductions :
 * - Critiques × 5, plafonnées à 30 pts
 * - Avertissements × 2, plafonnées à 15 pts
 * - Infos × 0.5, plafonnées à 5 pts
 * - Score final = max(0, 100 - somme des déductions plafonnées)
 *
 * Comptage :
 * - CO-01 : 1 problème si déclenché (critique)
 * - CO-02 : 1 par cluster (critique)
 * - CO-03 : 1 par cluster (avertissement)
 * - CO-04 : 1 par company (avertissement)
 * - CO-05 : 1 par company (info)
 * - CO-06 : 1 par company (info)
 * - CO-07 : 1 par company (info)
 * - CO-08 : 1 par company (info)
 */
export function calculateCompanyScore(results: CompanyAuditResults): CompanyScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // CO-01 : domain rate — critique
  if (results.co01.triggered) critiques += 1;
  // CO-02 : doublons domain — critique (1 par cluster)
  critiques += results.co02.length;
  // CO-03 : doublons nom — avertissement (1 par cluster)
  avertissements += results.co03.length;
  // CO-04 : sans contact — avertissement (1 par company)
  avertissements += results.co04.length;
  // CO-05 : sans owner — info (1 par company)
  infos += results.co05.length;
  // CO-06 : sans industrie — info (1 par company)
  infos += results.co06.length;
  // CO-07 : sans dimensionnement — info (1 par company)
  infos += results.co07.length;
  // CO-08 : stale — info (1 par company)
  infos += results.co08.length;

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
