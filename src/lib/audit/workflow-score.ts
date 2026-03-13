import { WorkflowAuditResults } from "@/lib/audit/types";

/**
 * Calcule le scoreLabel à partir d'un score numérique selon la scale PRD-04.
 * 0-49 → Critique, 50-69 → À améliorer, 70-89 → Bon, 90-100 → Excellent
 */
export function getScoreLabel(score: number): string {
  if (score <= 49) return "Critique";
  if (score <= 69) return "À améliorer";
  if (score <= 89) return "Bon";
  return "Excellent";
}

/**
 * Calcule le score workflows à partir des résultats de l'audit.
 * Retourne null si hasWorkflows=false (pas de workflows → domaine exclu).
 */
export function calculateWorkflowScore(results: Pick<WorkflowAuditResults, "hasWorkflows" | "w1" | "w2" | "w3" | "w4" | "w5" | "w6" | "w7">): number | null {
  if (!results.hasWorkflows) return null;

  const critiques = results.w1.length + results.w2.length;
  const avertissements = results.w3.length + results.w4.length;
  const infos = results.w5.length + results.w6.length + results.w7.length;

  const deductionCritiques = Math.min(critiques * 5, 30);
  const deductionAvertissements = Math.min(avertissements * 2, 15);
  const deductionInfos = Math.min(infos * 0.5, 5);

  return Math.max(0, Math.round(100 - deductionCritiques - deductionAvertissements - deductionInfos));
}
