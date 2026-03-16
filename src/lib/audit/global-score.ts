import { AuditResults, WorkflowAuditResults, ContactAuditResults, CompanyAuditResults, UserAuditResults, DealAuditResults, GlobalAuditResults } from "@/lib/audit/types";

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
 * Calcule le score global en combinant tous les domaines actifs.
 *
 * EP-06 : pondération renforcée pour Deals (coefficient 1.5), autres à 1.0.
 * score_global = Σ(score × poids) / Σ(poids) des domaines actifs
 */
export function calculateGlobalScore(
  propertyResults: AuditResults,
  workflowResults: WorkflowAuditResults | null,
  contactResults?: ContactAuditResults | null,
  companyResults?: CompanyAuditResults | null,
  userResults?: UserAuditResults | null,
  dealResults?: DealAuditResults | null,
): GlobalAuditResults {
  const propertyScore = propertyResults.score;
  const workflowScore = workflowResults?.score ?? null;
  const contactScore = contactResults?.score ?? null;
  const companyScore = companyResults?.score ?? null;
  const userScore = (userResults?.hasUsers && !userResults?.scopeError) ? userResults.score : null;
  const dealScore = dealResults?.hasDeals ? dealResults.score : null;

  // Weighted scoring: deals get 1.5, all others get 1.0
  const DEAL_WEIGHT = 1.5;
  const DEFAULT_WEIGHT = 1.0;

  let weightedSum = propertyScore * DEFAULT_WEIGHT;
  let totalWeight = DEFAULT_WEIGHT;

  if (contactScore !== null) { weightedSum += contactScore * DEFAULT_WEIGHT; totalWeight += DEFAULT_WEIGHT; }
  if (companyScore !== null) { weightedSum += companyScore * DEFAULT_WEIGHT; totalWeight += DEFAULT_WEIGHT; }
  if (workflowScore !== null) { weightedSum += workflowScore * DEFAULT_WEIGHT; totalWeight += DEFAULT_WEIGHT; }
  if (userScore !== null) { weightedSum += userScore * DEFAULT_WEIGHT; totalWeight += DEFAULT_WEIGHT; }
  if (dealScore !== null) { weightedSum += dealScore * DEAL_WEIGHT; totalWeight += DEAL_WEIGHT; }

  const globalScore = Math.round(weightedSum / totalWeight);

  const propertyWeight = DEFAULT_WEIGHT / totalWeight;
  const contactWeight = contactScore !== null ? DEFAULT_WEIGHT / totalWeight : 0;
  const companyWeight = companyScore !== null ? DEFAULT_WEIGHT / totalWeight : 0;
  const workflowWeight = workflowScore !== null ? DEFAULT_WEIGHT / totalWeight : 0;
  const userWeight = userScore !== null ? DEFAULT_WEIGHT / totalWeight : 0;
  const dealWeight = dealScore !== null ? DEAL_WEIGHT / totalWeight : 0;

  return {
    propertyResults,
    workflowResults,
    contactResults: contactResults ?? null,
    companyResults: companyResults ?? null,
    userResults: userResults ?? null,
    dealResults: dealResults ?? null,
    globalScore,
    globalScoreLabel: scoreLabelFromScore(globalScore),
    propertyWeight,
    workflowWeight,
    contactWeight,
    companyWeight,
    userWeight,
    dealWeight,
  };
}
