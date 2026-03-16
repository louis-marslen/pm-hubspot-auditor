import { ContactAuditResults } from "@/lib/audit/types";

interface ContactScoreResult {
  score: number;
  label: string;
  critiques: number;
  avertissements: number;
  infos: number;
}

/**
 * Calcule le score de santé "Contacts" selon la formule PRD EP-05.
 *
 * Déductions :
 * - Critiques × 5, plafonnées à 30 pts
 * - Avertissements × 2, plafonnées à 15 pts
 * - Infos × 0.5, plafonnées à 5 pts
 * - Score final = max(0, 100 - somme des déductions plafonnées)
 *
 * Comptage :
 * - C-01 : 1 problème si déclenché (critique)
 * - C-02 : 1 problème si count > 0 (critique)
 * - C-03 : 1 problème si déclenché (avertissement)
 * - C-04a : 1 problème si count > 0 (avertissement)
 * - C-04b : 1 problème si count > 0 (info)
 * - C-04c : 1 problème si triggered (avertissement)
 * - C-04d : 1 problème si count > 0 (info)
 * - C-05 : 1 problème si déclenché (info)
 * - C-06 : 1 par cluster (critique)
 * - C-07 : 1 par cluster (avertissement)
 * - C-08 : 1 par cluster (avertissement)
 * - C-09 : 1 par contact (avertissement)
 * - C-10 : 1 par contact (info)
 * - C-11 : 1 par contact (info)
 * - C-12 : 1 par contact (info)
 */
export function calculateContactScore(results: ContactAuditResults): ContactScoreResult {
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  // C-01 : email rate — critique
  if (results.c01.triggered) critiques += 1;
  // C-02 : sans nom — critique
  if (results.c02.count > 0) critiques += 1;
  // C-03 : lifecycle rate — avertissement
  if (results.c03.triggered) avertissements += 1;
  // C-04a : deal won sans customer — avertissement
  if (results.c04a.count > 0) avertissements += 1;
  // C-04b : customer sans deal won — info
  if (results.c04b.count > 0) infos += 1;
  // C-04c : 0 MQL/SQL avec deals — avertissement
  if (results.c04c.triggered) avertissements += 1;
  // C-04d : lead avec deal actif — info
  if (results.c04d.count > 0) infos += 1;
  // C-05 : sans company — info
  if (results.c05 !== null && results.c05.triggered) infos += 1;

  // C-06 : doublons email — critique (1 par cluster)
  critiques += results.c06.length;
  // C-07 : doublons nom+company — avertissement (1 par cluster)
  avertissements += results.c07.length;
  // C-08 : doublons téléphone — avertissement (1 par cluster)
  avertissements += results.c08.length;

  // C-09 : email invalide — avertissement (1 par contact)
  avertissements += results.c09.length;
  // C-10 : contact stale — info (1 par contact)
  infos += results.c10.length;
  // C-11 : sans owner — info (1 par contact)
  infos += results.c11.length;
  // C-12 : sans source — info (1 par contact)
  infos += results.c12.length;

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
