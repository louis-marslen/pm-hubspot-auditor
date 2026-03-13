import { WorkflowIssue, WorkflowAuditResults } from "@/lib/audit/types";

// Période de grâce : workflows créés il y a moins de N jours sont exclus des règles de contenu
const GRACE_DAYS = 7;
// W3 : workflow actif sans enrôlement depuis N jours
const ZOMBIE_DAYS = 90;
// W4 : workflow inactif depuis > N jours → avertissement; <= N jours → info (W5)
const INACTIVE_WARN = 90;
// Patterns de nommage insuffisant
const BAD_NAME_PATTERNS = [/^copy of /i, /^new workflow$/i, /^workflow\s*\d*$/i];
const MIN_NAME_LEN = 5;

function daysSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24));
}

function isBadName(name: string): boolean {
  return BAD_NAME_PATTERNS.some((p) => p.test(name.trim())) || name.trim().length < MIN_NAME_LEN;
}

interface RawWorkflow {
  id: number;
  name: string;
  type: string;  // "DRIP_DELAY" (legacy) or "PLATFORM_FLOW" (new)
  enabled: boolean;
  insertedAt: string;  // createdAt
  updatedAt: string;
  actions?: unknown[];
  enrollmentCriteria?: unknown;
  contactListIds?: { enrolled?: unknown[] };
  migrationStatus?: { portalId?: number; state?: string };
  // v3 new-style fields
  createdAt?: string;
  isEnabled?: boolean;
  startAction?: { type?: string; actions?: unknown[] };
  stats?: { numCurrentlyEnrolled?: number; numEverEnrolled?: number };
  folder?: { folderId?: number };
}

/**
 * Mappe un workflow brut de l'API HubSpot vers notre WorkflowIssue.
 * Supporte les deux formats : ancien (enabled/insertedAt) et nouveau (isEnabled/createdAt).
 */
function mapWorkflow(raw: RawWorkflow): WorkflowIssue {
  const isLegacy = raw.type !== "PLATFORM_FLOW";
  const status: "ACTIVE" | "INACTIVE" =
    (raw.isEnabled ?? raw.enabled) ? "ACTIVE" : "INACTIVE";

  const createdAt = raw.createdAt ?? raw.insertedAt ?? "";
  const updatedAt = raw.updatedAt ?? "";

  // Pour les workflows inactifs, updatedAt est utilisé comme proxy de deactivatedAt
  const deactivatedAt = status === "INACTIVE" ? updatedAt : null;

  // Nombre d'actions (best-effort selon le format)
  let actionCount = 0;
  if (raw.actions) actionCount = raw.actions.length;
  else if (raw.startAction?.actions) actionCount = (raw.startAction.actions as unknown[]).length;

  // errorRate : non exposé directement dans l'API v3 → null (best-effort)
  const errorRate: number | null = null;

  // Dernier enrôlement : non exposé directement → null
  const lastEnrollmentAt: string | null = null;

  // folderId : disponible sur new-style via folder.folderId
  const folderId =
    raw.folder?.folderId !== undefined ? raw.folder.folderId : null;

  return {
    id: String(raw.id),
    name: raw.name,
    folderId,
    createdAt,
    updatedAt,
    status,
    lastEnrollmentAt,
    actionCount,
    errorRate,
    deactivatedAt,
    isLegacy,
  };
}

/**
 * Fetche tous les workflows via GET /automation/v3/workflows.
 * Retourne un seul appel pour tout le workspace — pas de pagination nécessaire.
 */
async function fetchAllWorkflows(accessToken: string): Promise<RawWorkflow[]> {
  const res = await fetch("https://api.hubapi.com/automation/v3/workflows", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot workflows API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // La réponse peut être { workflows: [] } ou directement un tableau selon la version
  return Array.isArray(data) ? data : (data.workflows ?? []);
}

/**
 * Applique les règles W1-W7 sur la liste des workflows.
 *
 * W1 : ACTIVE + errorRate !== null + errorRate > 10% → critique
 * W2 : ACTIVE + actionCount === 0 + age >= GRACE_DAYS → critique
 * W3 : ACTIVE + age >= GRACE_DAYS + (lastEnrollmentAt=null OU >ZOMBIE_DAYS) + age > 30 → avertissement
 * W4 : INACTIVE + deactivatedAt + daysSince > INACTIVE_WARN → avertissement
 * W5 : INACTIVE + (deactivatedAt=null OU daysSince <= INACTIVE_WARN) → info
 * W6 : age >= GRACE_DAYS + (BAD_NAME ou name < MIN_NAME_LEN) → info
 * W7 : age >= GRACE_DAYS + folderId === null → info
 *
 * Un même workflow peut déclencher plusieurs règles simultanément.
 */
export async function runWorkflowRules(accessToken: string): Promise<WorkflowAuditResults> {
  let rawWorkflows: RawWorkflow[];
  try {
    rawWorkflows = await fetchAllWorkflows(accessToken);
  } catch (err) {
    throw new Error(`Impossible de récupérer les workflows: ${err instanceof Error ? err.message : err}`);
  }

  const totalWorkflows = rawWorkflows.length;

  if (totalWorkflows === 0) {
    return {
      totalWorkflows: 0,
      hasWorkflows: false,
      w1: [], w2: [], w3: [], w4: [], w5: [], w6: [], w7: [],
      notAnalyzed: [],
      score: null,
      scoreLabel: null,
      totalCritiques: 0,
      totalAvertissements: 0,
      totalInfos: 0,
    };
  }

  const w1: WorkflowIssue[] = [];
  const w2: WorkflowIssue[] = [];
  const w3: WorkflowIssue[] = [];
  const w4: WorkflowIssue[] = [];
  const w5: WorkflowIssue[] = [];
  const w6: WorkflowIssue[] = [];
  const w7: WorkflowIssue[] = [];
  const notAnalyzed: WorkflowIssue[] = [];

  for (const raw of rawWorkflows) {
    let wf: WorkflowIssue;
    try {
      wf = mapWorkflow(raw);
    } catch {
      notAnalyzed.push({ id: String(raw.id), name: raw.name ?? "?", folderId: null, createdAt: "", updatedAt: "", status: "INACTIVE", lastEnrollmentAt: null, actionCount: 0, errorRate: null, deactivatedAt: null, notAnalyzed: true });
      continue;
    }

    const ageInDays = daysSince(wf.createdAt) ?? 0;
    const isPastGrace = ageInDays >= GRACE_DAYS;

    // W1 : workflow actif avec taux d'erreur > 10%
    if (wf.status === "ACTIVE" && wf.errorRate !== null && wf.errorRate > 10) {
      w1.push(wf);
    }

    // W2 : workflow actif sans actions (créé il y a >= GRACE_DAYS)
    if (wf.status === "ACTIVE" && wf.actionCount === 0 && isPastGrace) {
      w2.push(wf);
    }

    // W3 : workflow actif sans enrôlement récent (créé il y a > 30j et >= GRACE_DAYS)
    if (wf.status === "ACTIVE" && isPastGrace && ageInDays > 30) {
      const lastEnrollDays = daysSince(wf.lastEnrollmentAt);
      if (lastEnrollDays === null || lastEnrollDays > ZOMBIE_DAYS) {
        w3.push(wf);
      }
    }

    // W4 / W5 : workflows inactifs
    if (wf.status === "INACTIVE") {
      const deactivatedDays = daysSince(wf.deactivatedAt);
      if (deactivatedDays !== null && deactivatedDays > INACTIVE_WARN) {
        // W4 : inactif depuis plus de INACTIVE_WARN jours → avertissement
        w4.push(wf);
      } else {
        // W5 : inactif récemment ou date inconnue → info
        w5.push(wf);
      }
    }

    // W6 : mauvais nommage (créé il y a >= GRACE_DAYS)
    if (isPastGrace && isBadName(wf.name)) {
      w6.push(wf);
    }

    // W7 : sans dossier (créé il y a >= GRACE_DAYS)
    if (isPastGrace && wf.folderId === null) {
      w7.push(wf);
    }
  }

  // Calcul du score
  let critiques = 0;
  let avertissements = 0;
  let infos = 0;

  critiques += w1.length;     // W1 : critique par workflow
  critiques += w2.length;     // W2 : critique par workflow
  avertissements += w3.length; // W3 : avertissement par workflow
  avertissements += w4.length; // W4 : avertissement par workflow
  infos += w5.length;          // W5 : info par workflow
  infos += w6.length;          // W6 : info par workflow
  infos += w7.length;          // W7 : info par workflow

  // Même formule que calculateScore() pour les propriétés
  const deductionCritiques = Math.min(critiques * 5, 30);
  const deductionAvertissements = Math.min(avertissements * 2, 15);
  const deductionInfos = Math.min(infos * 0.5, 5);
  const score = Math.max(0, Math.round(100 - deductionCritiques - deductionAvertissements - deductionInfos));

  // Scale PRD-04 : 0-49 Critique, 50-69 À améliorer, 70-89 Bon, 90-100 Excellent
  let scoreLabel: string;
  if (score <= 49) scoreLabel = "Critique";
  else if (score <= 69) scoreLabel = "À améliorer";
  else if (score <= 89) scoreLabel = "Bon";
  else scoreLabel = "Excellent";

  return {
    totalWorkflows,
    hasWorkflows: true,
    w1, w2, w3, w4, w5, w6, w7,
    notAnalyzed,
    score,
    scoreLabel,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
