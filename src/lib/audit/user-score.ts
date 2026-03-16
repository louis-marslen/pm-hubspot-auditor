import { UserAuditResults } from "@/lib/audit/types";

interface UserScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Utilisateurs & Équipes" selon la formule PRD EP-09.
 *
 * Déductions :
 * - Critiques × 5, plafonnées à 30 pts
 * - Avertissements × 2, plafonnées à 15 pts
 * - Infos × 0.5, plafonnées à 5 pts
 * - Score final = max(0, 100 - somme des déductions plafonnées)
 *
 * Comptage :
 * - U-01 : 1 par utilisateur sans équipe (avertissement)
 * - U-02 : 1 unique si seuil franchi (critique)
 * - U-03 : 1 par utilisateur sans rôle (avertissement)
 * - U-04 : 1 unique si seuil franchi (avertissement)
 * - U-05 : 1 par utilisateur inactif (critique)
 * - U-06 : 1 par équipe vide (info)
 * - U-07 : 1 par owner sans objet CRM (info)
 */
export function calculateUserScore(results: UserAuditResults): UserScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // U-01 : sans équipe — avertissement (1 par user)
  avertissements += results.u01.length;

  // U-02 : super admins en excès — critique (1 unique)
  if (results.u02.triggered) critiques += 1;

  // U-03 : sans rôle — avertissement (1 par user)
  avertissements += results.u03.length;

  // U-04 : pas de différenciation — avertissement (1 unique)
  if (results.u04.triggered) avertissements += 1;

  // U-05 : inactifs — critique (1 par user)
  critiques += results.u05.inactiveUsers.length;

  // U-06 : équipes vides — info (1 par équipe)
  infos += results.u06.length;

  // U-07 : owner sans objet CRM — info (1 par owner)
  infos += results.u07.length;

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
