import { createClient } from "@supabase/supabase-js";
import { AuditProgress, DomainProgress } from "@/lib/audit/types";

const STEPS = ["fetching", "analyzing", "scoring"] as const;

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Crée l'état initial de progression (tous les domaines en pending).
 */
export function initProgress(domains: string[]): AuditProgress {
  const entries: Record<string, DomainProgress> = {};
  for (const domain of domains) {
    entries[domain] = {
      status: "pending",
      currentStep: null,
      completedSteps: [],
      itemCount: null,
      error: null,
    };
  }
  return {
    domains: entries,
    llmSummary: { status: "pending" },
    globalProgress: 0,
  };
}

/**
 * Avance une sous-étape d'un domaine. Monotone : ne régresse jamais.
 */
export function updateDomainStep(
  progress: AuditProgress,
  domain: string,
  step: "fetching" | "analyzing" | "scoring",
  itemCount?: number,
): AuditProgress {
  const prev = progress.domains[domain];
  if (!prev) return progress;

  // Ne pas régresser : si le domaine est déjà completed ou error, ne rien faire
  if (prev.status === "completed" || prev.status === "error") return progress;

  // Marquer les étapes précédentes comme complétées
  const stepIndex = STEPS.indexOf(step);
  const completedSteps = STEPS.slice(0, stepIndex);

  return {
    ...progress,
    domains: {
      ...progress.domains,
      [domain]: {
        ...prev,
        status: "running",
        currentStep: step,
        completedSteps: [...completedSteps],
        itemCount: itemCount ?? prev.itemCount,
        error: null,
      },
    },
    globalProgress: calculateGlobalProgress({
      ...progress,
      domains: {
        ...progress.domains,
        [domain]: {
          ...prev,
          status: "running",
          currentStep: step,
          completedSteps: [...completedSteps],
        },
      },
    }),
  };
}

/**
 * Marque un domaine comme terminé (toutes les sous-étapes complétées).
 */
export function completeDomain(progress: AuditProgress, domain: string): AuditProgress {
  const prev = progress.domains[domain];
  if (!prev) return progress;

  const updated = {
    ...progress,
    domains: {
      ...progress.domains,
      [domain]: {
        ...prev,
        status: "completed" as const,
        currentStep: null,
        completedSteps: [...STEPS],
        error: null,
      },
    },
  };
  updated.globalProgress = calculateGlobalProgress(updated);
  return updated;
}

/**
 * Marque un domaine en erreur.
 */
export function failDomain(progress: AuditProgress, domain: string, error: string): AuditProgress {
  const prev = progress.domains[domain];
  if (!prev) return progress;

  const updated = {
    ...progress,
    domains: {
      ...progress.domains,
      [domain]: {
        ...prev,
        status: "error" as const,
        currentStep: null,
        error,
      },
    },
  };
  updated.globalProgress = calculateGlobalProgress(updated);
  return updated;
}

/**
 * Calcul du pourcentage global : completed_steps / (num_domains × 3 + 1).
 * Le +1 correspond à l'étape LLM summary.
 */
export function calculateGlobalProgress(progress: AuditProgress): number {
  const domains = Object.values(progress.domains);
  const totalSteps = domains.length * 3 + 1; // +1 pour LLM
  let completed = 0;

  for (const d of domains) {
    completed += d.completedSteps.length;
  }

  if (progress.llmSummary.status === "completed") {
    completed += 1;
  }

  return Math.min(completed / totalSteps, 1);
}

/**
 * Persiste l'état de progression dans audit_runs via le service role client.
 * Utilise le service role car cette fonction s'exécute en arrière-plan
 * après que la réponse HTTP a été envoyée (pas de cookies disponibles).
 */
export async function persistProgress(auditId: string, progress: AuditProgress): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("audit_runs")
    .update({ audit_progress: progress })
    .eq("id", auditId);
}
