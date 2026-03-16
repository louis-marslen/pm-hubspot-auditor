import { AuditResults } from "@/lib/audit/types";

interface ScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Propriétés" selon la formule PRD section 6.6.
 *
 * Déductions :
 * - Critiques × 5, plafonnées à 30 pts
 * - Avertissements × 2, plafonnées à 15 pts
 * - Infos × 0.5, plafonnées à 5 pts
 * - Score final = max(0, 100 - somme des déductions plafonnées)
 *
 * Seuils (PRD-04) :
 * - 0–49 → Critique
 * - 50–69 → À améliorer
 * - 70–89 → Bon
 * - 90–100 → Excellent
 *
 * Comptage spécial (P7-P11 migrées vers ContactAuditResults en EP-05) :
 * - P12, P13, P14 = 1 problème max si déclenché (pas 1 par record)
 */
export function calculateScore(results: AuditResults): ScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // Propriétés custom
  critiques += results.p1.length; // P1 : propriétés vides > 90j
  avertissements += results.p2.length; // P2 : faible fill rate > 90j
  avertissements += results.p3.length; // P3 : doublons de labels
  infos += results.p4.length; // P4 : sans description
  infos += results.p5.length; // P5 : groupe par défaut
  avertissements += results.p6.length; // P6 : mauvais typage

  // Propriétés système (P7-P11 migrées vers contacts EP-05, P12 migrée vers companies EP-05b)
  if (results.p13.triggered) critiques += 1; // P13 : deals sans montant
  if (results.p14.triggered) critiques += 1; // P14 : deals sans date de clôture
  critiques += results.p15.length; // P15 : deals bloqués (1 par deal)
  avertissements += results.p16.length; // P16 : stages avec props manquantes

  // Calcul des déductions plafonnées
  const deductionCritiques = Math.min(critiques * 5, 30);
  const deductionAvertissements = Math.min(avertissements * 2, 15);
  const deductionInfos = Math.min(infos * 0.5, 5);

  const score = Math.max(0, Math.round(100 - deductionCritiques - deductionAvertissements - deductionInfos));

  // Scale PRD-04 : 0-49 Critique, 50-69 À améliorer, 70-89 Bon, 90-100 Excellent
  let label: string;
  if (score <= 49) label = "Critique";
  else if (score <= 69) label = "À améliorer";
  else if (score <= 89) label = "Bon";
  else label = "Excellent";

  return { score, label, critiques, avertissements, infos };
}
