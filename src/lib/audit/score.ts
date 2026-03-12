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
 * Seuils :
 * - 0–40 → Critique
 * - 41–70 → À améliorer
 * - 71–90 → Bon
 * - 91–100 → Excellent
 *
 * Comptage spécial :
 * - P7, P9, P11, P12, P13, P14 = 1 problème max si déclenché (pas 1 par record)
 * - P8, P10c = 1 problème unique si déclenché
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

  // Propriétés système (1 problème si déclenché)
  if (results.p7.triggered) critiques += 1; // P7 : email non renseigné
  if (results.p8.count > 0) avertissements += 1; // P8 : contacts sans prénom/nom
  if (results.p9.triggered) avertissements += 1; // P9 : lifecycle non renseigné
  if (results.p10a.count > 0) avertissements += 1; // P10a : lifecycle incohérent
  if (results.p10b.count > 0) infos += 1; // P10b : customers sans deal
  if (results.p10c.triggered) critiques += 1; // P10c : 0 MQL/SQL avec deals open
  if (results.p10d.count > 0) infos += 1; // P10d : leads avec deals open
  if (results.p11 !== null && results.p11.triggered) avertissements += 1; // P11 : contacts sans company
  if (results.p12.triggered) avertissements += 1; // P12 : companies sans domaine
  if (results.p13.triggered) critiques += 1; // P13 : deals sans montant
  if (results.p14.triggered) critiques += 1; // P14 : deals sans date de clôture
  critiques += results.p15.length; // P15 : deals bloqués (1 par deal)
  avertissements += results.p16.length; // P16 : stages avec props manquantes

  // Calcul des déductions plafonnées
  const deductionCritiques = Math.min(critiques * 5, 30);
  const deductionAvertissements = Math.min(avertissements * 2, 15);
  const deductionInfos = Math.min(infos * 0.5, 5);

  const score = Math.max(0, Math.round(100 - deductionCritiques - deductionAvertissements - deductionInfos));

  let label: string;
  if (score <= 40) label = "Critique";
  else if (score <= 70) label = "À améliorer";
  else if (score <= 90) label = "Bon";
  else label = "Excellent";

  return { score, label, critiques, avertissements, infos };
}
