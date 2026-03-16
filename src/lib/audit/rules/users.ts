// EP-09 : Règles d'audit utilisateurs & équipes (U-01 à U-07)
// Implémenté dans les phases suivantes.

import { HubSpotClient } from "@/lib/hubspot/api-client";
import type {
  UserIssue,
  TeamIssue,
  RoleDistribution,
  HubSpotUser,
  HubSpotTeam,
  HubSpotRole,
  HubSpotOwner,
  LoginActivity,
} from "@/lib/audit/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toUserIssue(
  user: HubSpotUser,
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
): UserIssue {
  const role = user.roleId ? roles.find((r) => r.id === user.roleId) : null;
  const team = user.primaryTeamId
    ? teams.find((t) => t.id === user.primaryTeamId)
    : null;
  return {
    userId: user.id,
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sans nom",
    role: user.superAdmin ? "Super Admin" : (role?.name ?? "Aucun rôle"),
    teamName: team?.name ?? null,
    createdAt: user.createdAt ?? null,
  };
}

// ─── U-01 — Utilisateur sans équipe (Avertissement 🟡) ──────────────────────

export function runU01(
  users: HubSpotUser[],
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
): UserIssue[] {
  return users
    .filter(
      (u) =>
        !u.primaryTeamId &&
        (!u.secondaryTeamIds || u.secondaryTeamIds.length === 0),
    )
    .map((u) => toUserIssue(u, roles, teams));
}

// ─── U-02 — Super Admins en excès (Critique 🔴) ─────────────────────────────

export interface U02Result {
  triggered: boolean;
  superAdminCount: number;
  totalUsers: number;
  rate: number;
  threshold: string;
  superAdmins: UserIssue[];
}

export function runU02(
  users: HubSpotUser[],
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
): U02Result {
  const totalUsers = users.length;
  const superAdmins = users.filter((u) => u.superAdmin);
  const saCount = superAdmins.length;
  const rate = totalUsers > 0 ? saCount / totalUsers : 0;

  let triggered = false;
  let threshold: string;

  if (totalUsers <= 5) {
    triggered = saCount > 2;
    threshold = "> 2 Super Admins";
  } else if (totalUsers <= 15) {
    triggered = saCount > 3 || rate > 0.2;
    threshold = "> 3 Super Admins ou > 20%";
  } else {
    triggered = rate > 0.2 || saCount > 5;
    threshold = "> 20% ou > 5 Super Admins";
  }

  return {
    triggered,
    superAdminCount: saCount,
    totalUsers,
    rate,
    threshold,
    superAdmins: superAdmins.map((u) => toUserIssue(u, roles, teams)),
  };
}

// ─── U-03 — Utilisateur sans rôle (Avertissement 🟡) ────────────────────────

export function runU03(
  users: HubSpotUser[],
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
): UserIssue[] {
  return users
    .filter((u) => !u.roleId && !u.superAdmin)
    .map((u) => toUserIssue(u, roles, teams));
}

// ─── U-04 — Absence de différenciation des rôles (Avertissement 🟡) ─────────

export interface U04Result {
  triggered: boolean;
  disabled: boolean;
  disabledReason: string | null;
  dominantRate: number;
  distribution: RoleDistribution[];
}

export function runU04(
  users: HubSpotUser[],
  roles: HubSpotRole[],
): U04Result {
  const nonSA = users.filter((u) => !u.superAdmin);

  if (nonSA.length <= 3) {
    return {
      triggered: false,
      disabled: true,
      disabledReason:
        "Règle non applicable — trop peu d'utilisateurs pour évaluer la différenciation des rôles",
      dominantRate: 0,
      distribution: [],
    };
  }

  // Group by roleId (null = un groupe)
  const groups: Record<string, number> = {};
  for (const u of nonSA) {
    const key = u.roleId ?? "__null__";
    groups[key] = (groups[key] ?? 0) + 1;
  }

  const distribution: RoleDistribution[] = Object.entries(groups)
    .map(([roleId, count]) => {
      const role =
        roleId === "__null__"
          ? null
          : roles.find((r) => r.id === roleId);
      return {
        roleId: roleId === "__null__" ? null : roleId,
        roleName: roleId === "__null__" ? "Aucun rôle" : (role?.name ?? roleId),
        count,
        percentage: count / nonSA.length,
      };
    })
    .sort((a, b) => b.count - a.count);

  const dominantRate = distribution[0]?.percentage ?? 0;
  const triggered = dominantRate > 0.8;

  return {
    triggered,
    disabled: false,
    disabledReason: null,
    dominantRate,
    distribution,
  };
}

// ─── U-05 — Utilisateur inactif (Critique 🔴) ──────────────────────────────

export interface U05Result {
  isEnterprise: boolean;
  inactiveUsers: UserIssue[];
  /** Date de dernière connexion (mode Enterprise) */
  lastLoginDates: Record<string, string | null>;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function runU05Enterprise(
  users: HubSpotUser[],
  loginActivities: LoginActivity[],
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
): U05Result {
  const now = Date.now();
  const cutoff = now - NINETY_DAYS_MS;
  const gracePeriod = now - THIRTY_DAYS_MS;

  // Build map: email → last successful login timestamp
  const lastLogin: Record<string, string> = {};
  for (const activity of loginActivities) {
    if (activity.loginSucceeded) {
      const existing = lastLogin[activity.id] ?? lastLogin[activity.email];
      const ts = activity.loginAt;
      if (!existing || ts > existing) {
        lastLogin[activity.id ?? activity.email] = ts;
        lastLogin[activity.email] = ts;
      }
    }
  }

  const inactiveUsers: UserIssue[] = [];
  const lastLoginDates: Record<string, string | null> = {};

  for (const user of users) {
    // Grace period: skip accounts created < 30 days ago
    if (user.createdAt && new Date(user.createdAt).getTime() > gracePeriod) {
      continue;
    }

    const lastLoginTs =
      lastLogin[user.id] ?? lastLogin[user.email] ?? null;
    lastLoginDates[user.id] = lastLoginTs;

    if (!lastLoginTs || new Date(lastLoginTs).getTime() < cutoff) {
      inactiveUsers.push(toUserIssue(user, roles, teams));
    }
  }

  return { isEnterprise: true, inactiveUsers, lastLoginDates };
}

export async function runU05Standard(
  owners: HubSpotOwner[],
  client: HubSpotClient,
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
  users: HubSpotUser[],
): Promise<U05Result> {
  const now = Date.now();
  const cutoff = now - NINETY_DAYS_MS;
  const gracePeriod = now - THIRTY_DAYS_MS;

  // Filter owners: non-archived, created > 90 days ago, not in grace period
  const candidates = owners.filter((o) => {
    if (o.archived) return false;
    const created = new Date(o.createdAt).getTime();
    if (created > gracePeriod) return false; // grace period 30j
    if (created > cutoff) return false; // created < 90j
    return true;
  });

  // Limit to 100 owners max
  const toCheck = candidates.slice(0, 100);
  const inactiveUsers: UserIssue[] = [];

  // Batch check CRM objects
  await client.batch(toCheck, async (owner) => {
    const hasObjects = await ownerHasCrmObjects(client, owner.id);
    if (!hasObjects) {
      // Find matching user for role/team info
      const matchingUser = users.find(
        (u) => u.email.toLowerCase() === owner.email.toLowerCase(),
      );
      inactiveUsers.push({
        userId: owner.id,
        email: owner.email,
        name:
          [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
          "Sans nom",
        role: matchingUser?.superAdmin
          ? "Super Admin"
          : matchingUser?.roleId
            ? (roles.find((r) => r.id === matchingUser.roleId)?.name ?? "Aucun rôle")
            : "Aucun rôle",
        teamName: matchingUser?.primaryTeamId
          ? (teams.find((t) => t.id === matchingUser.primaryTeamId)?.name ?? null)
          : null,
        createdAt: owner.createdAt,
      });
    }
    return null;
  });

  return { isEnterprise: false, inactiveUsers, lastLoginDates: {} };
}

// ─── U-06 — Équipe vide (Info 🔵) ──────────────────────────────────────────

export function runU06(teams: HubSpotTeam[]): TeamIssue[] {
  return teams
    .filter(
      (t) =>
        (!t.userIds || t.userIds.length === 0) &&
        (!t.secondaryUserIds || t.secondaryUserIds.length === 0),
    )
    .map((t) => ({ teamId: t.id, name: t.name }));
}

// ─── U-07 — Owner sans objet CRM (Info 🔵) ─────────────────────────────────

export async function runU07(
  owners: HubSpotOwner[],
  client: HubSpotClient,
  roles: HubSpotRole[],
  teams: HubSpotTeam[],
  users: HubSpotUser[],
): Promise<UserIssue[]> {
  const activeOwners = owners.filter((o) => !o.archived);
  const toCheck = activeOwners.slice(0, 100);
  const result: UserIssue[] = [];

  await client.batch(toCheck, async (owner) => {
    const hasObjects = await ownerHasCrmObjects(client, owner.id);
    if (!hasObjects) {
      const matchingUser = users.find(
        (u) => u.email.toLowerCase() === owner.email.toLowerCase(),
      );
      result.push({
        userId: owner.id,
        email: owner.email,
        name:
          [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
          "Sans nom",
        role: matchingUser?.superAdmin
          ? "Super Admin"
          : matchingUser?.roleId
            ? (roles.find((r) => r.id === matchingUser.roleId)?.name ?? "Aucun rôle")
            : "Aucun rôle",
        teamName: matchingUser?.primaryTeamId
          ? (teams.find((t) => t.id === matchingUser.primaryTeamId)?.name ?? null)
          : null,
        createdAt: owner.createdAt,
      });
    }
    return null;
  });

  return result;
}

// ─── Shared: check if an owner has any CRM objects ──────────────────────────

async function ownerHasCrmObjects(
  client: HubSpotClient,
  ownerId: string,
): Promise<boolean> {
  const searchBody = (objectType: string) => ({
    filterGroups: [
      {
        filters: [
          {
            propertyName: "hubspot_owner_id",
            operator: "EQ",
            value: ownerId,
          },
        ],
      },
    ],
    properties: ["hs_object_id"],
    limit: 1,
  });

  // Court-circuit: dès qu'un objet est trouvé, retourner true
  for (const objectType of ["contacts", "deals", "companies"] as const) {
    try {
      const res = await client.post<{ total: number }>(
        `/crm/v3/objects/${objectType}/search`,
        searchBody(objectType),
      );
      if (res.total > 0) return true;
    } catch {
      // Si erreur API (ex: scope manquant), considérer comme non vérifiable — skip
      continue;
    }
  }

  return false;
}
