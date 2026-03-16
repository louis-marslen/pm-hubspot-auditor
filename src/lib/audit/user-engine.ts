import { HubSpotClient } from "@/lib/hubspot/api-client";
import { UserAuditResults } from "@/lib/audit/types";
import { calculateUserScore } from "@/lib/audit/user-score";
import {
  fetchUsers,
  fetchTeams,
  fetchRoles,
  fetchLoginHistory,
  fetchOwners,
} from "@/lib/hubspot/settings-api";
import {
  runU01,
  runU02,
  runU03,
  runU04,
  runU05Enterprise,
  runU05Standard,
  runU06,
  runU07,
} from "@/lib/audit/rules/users";

/**
 * Orchestrateur du domaine Utilisateurs & Équipes (EP-09).
 * Récupère les données, exécute U-01 à U-07, calcule le score.
 *
 * Retourne null si < 2 utilisateurs.
 * Retourne des résultats avec scopeError si le scope settings.users.read est manquant.
 */
export async function runUserAudit(
  accessToken: string,
): Promise<UserAuditResults | null> {
  const t = (label: string, since: number) =>
    console.log(`[audit:users] ${label}: ${Date.now() - since}ms`);
  const t0 = Date.now();

  // 1. Fetch users (scope required: settings.users.read)
  let users;
  try {
    users = await fetchUsers(accessToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("403")) {
      // Scope manquant — retourner résultat vide avec erreur
      return {
        totalUsers: 0,
        totalTeams: 0,
        totalRoles: 0,
        hasUsers: false,
        isEnterprise: false,
        u01: [],
        u02: { triggered: false, superAdminCount: 0, totalUsers: 0, rate: 0, threshold: "", superAdmins: [] },
        u03: [],
        u04: { triggered: false, disabled: true, disabledReason: null, dominantRate: 0, distribution: [] },
        u05: { isEnterprise: false, inactiveUsers: [], lastLoginDates: {} },
        u06: [],
        u07: [],
        score: 0,
        scoreLabel: "Critique",
        totalCritiques: 0,
        totalAvertissements: 0,
        totalInfos: 0,
        scopeError:
          "Impossible d'analyser les utilisateurs — le scope 'settings.users.read' n'est pas accordé. Veuillez re-autoriser l'application avec les scopes nécessaires.",
      };
    }
    throw err;
  }
  t("fetch users", t0);

  // Condition d'activation : ≥ 2 utilisateurs
  if (users.length < 2) {
    return null;
  }

  // 2. Fetch teams, roles, login history, owners in parallel
  const [teams, roles, loginHistory, owners] = await Promise.all([
    fetchTeams(accessToken).catch(() => []),
    fetchRoles(accessToken).catch(() => []),
    fetchLoginHistory(accessToken),
    fetchOwners(accessToken).catch(() => []),
  ]);
  t("fetch teams/roles/login/owners", t0);

  const client = new HubSpotClient(accessToken);

  // 3. Execute rules U-01 to U-04 (synchronous, data-only)
  const u01 = runU01(users, roles, teams);
  const u02 = runU02(users, roles, teams);
  const u03 = runU03(users, roles, teams);
  const u04 = runU04(users, roles);
  t("u01-u04", t0);

  // 4. U-05 — dual mode
  let u05;
  if (loginHistory !== null) {
    u05 = runU05Enterprise(users, loginHistory, roles, teams);
  } else {
    u05 = await runU05Standard(owners, client, roles, teams, users);
  }
  t("u05", t0);

  // 5. U-06 — empty teams (synchronous)
  const u06 = runU06(teams);

  // 6. U-07 — owners without CRM objects
  const u07 = await runU07(owners, client, roles, teams, users);
  t("u07", t0);

  // 7. Calculate score
  const partialResults: UserAuditResults = {
    totalUsers: users.length,
    totalTeams: teams.length,
    totalRoles: roles.length,
    hasUsers: true,
    isEnterprise: loginHistory !== null,
    u01,
    u02,
    u03,
    u04,
    u05,
    u06,
    u07,
    score: 0,
    scoreLabel: "",
    totalCritiques: 0,
    totalAvertissements: 0,
    totalInfos: 0,
    scopeError: null,
  };

  const { score, label, critiques, avertissements, infos } =
    calculateUserScore(partialResults);
  t("score calculated", t0);

  return {
    ...partialResults,
    score,
    scoreLabel: label,
    totalCritiques: critiques,
    totalAvertissements: avertissements,
    totalInfos: infos,
  };
}
