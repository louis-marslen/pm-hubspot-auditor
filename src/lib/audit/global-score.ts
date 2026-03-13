import { AuditResults, WorkflowAuditResults, GlobalAuditResults } from "@/lib/audit/types";

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
 * Calcule le score global en combinant propriétés et workflows.
 *
 * Redistribution :
 * - Si workflowScore === null (pas de workflows) → propertyWeight = 1.0, workflowWeight = 0
 * - Sinon → 50/50, globalScore = Math.round(propertyScore * 0.5 + workflowScore * 0.5)
 */
export function calculateGlobalScore(
  propertyResults: AuditResults,
  workflowResults: WorkflowAuditResults | null,
): GlobalAuditResults {
  const propertyScore = propertyResults.score;
  const workflowScore = workflowResults?.score ?? null;

  let globalScore: number;
  let propertyWeight: number;
  let workflowWeight: number;

  if (workflowScore === null) {
    // Pas de workflows : score global = score propriétés
    globalScore = propertyScore;
    propertyWeight = 1.0;
    workflowWeight = 0;
  } else {
    globalScore = Math.round(propertyScore * 0.5 + workflowScore * 0.5);
    propertyWeight = 0.5;
    workflowWeight = 0.5;
  }

  return {
    propertyResults,
    workflowResults,
    globalScore,
    globalScoreLabel: scoreLabelFromScore(globalScore),
    propertyWeight,
    workflowWeight,
  };
}
