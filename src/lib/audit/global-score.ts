import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, GlobalAuditResults } from "@/lib/audit/types";

/**
 * Retourne le scoreLabel selon la scale PRD-04.
 * 0-49 → Critique, 50-69 → À améliorer, 70-89 → Bon, 90-100 → Excellent
 */
function scoreLabelFromScore(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}

/**
 * Calcule le score global en combinant propriétés, contacts, companies, workflows et utilisateurs.
 *
 * Redistribution EP-09 : pondération égale entre domaines actifs (jusqu'à 5).
 * - domaines actifs = [propriétés, contacts, companies, workflows, utilisateurs].filter(score !== null)
 * - score_global = somme(scores) / nombre_domaines_actifs
 */
export function calculateGlobalScore(
  propertyResults: AuditResults,
  workflowResults: WorkflowAuditResults | null,
  contactResults?: ContactAuditResults | null,
  companyResults?: CompanyAuditResults | null,
  userResults?: UserAuditResults | null,
): GlobalAuditResults {
  const propertyScore = propertyResults.score;
  const workflowScore = workflowResults?.score ?? null;
  const contactScore = contactResults?.score ?? null;
  const companyScore = companyResults?.score ?? null;
  const userScore = (userResults?.hasUsers && !userResults?.scopeError) ? userResults.score : null;

  // Collecter les domaines actifs (score non-null)
  const activeScores: number[] = [propertyScore];
  if (contactScore !== null) activeScores.push(contactScore);
  if (companyScore !== null) activeScores.push(companyScore);
  if (workflowScore !== null) activeScores.push(workflowScore);
  if (userScore !== null) activeScores.push(userScore);

  const weight = activeScores.length > 0 ? 1 / activeScores.length : 0;
  const globalScore = Math.round(
    activeScores.reduce((sum, s) => sum + s, 0) / activeScores.length
  );

  const propertyWeight = weight;
  const workflowWeight = workflowScore !== null ? weight : 0;
  const contactWeight = contactScore !== null ? weight : 0;
  const companyWeight = companyScore !== null ? weight : 0;
  const userWeight = userScore !== null ? weight : 0;

  return {
    propertyResults,
    workflowResults,
    contactResults: contactResults ?? null,
    companyResults: companyResults ?? null,
    userResults: userResults ?? null,
    globalScore,
    globalScoreLabel: scoreLabelFromScore(globalScore),
    propertyWeight,
    workflowWeight,
    contactWeight,
    companyWeight,
    userWeight,
  };
}
