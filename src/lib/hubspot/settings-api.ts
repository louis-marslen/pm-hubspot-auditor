import { HubSpotClient } from "@/lib/hubspot/api-client";
import type {
  HubSpotUser,
  HubSpotTeam,
  HubSpotRole,
  HubSpotOwner,
  LoginActivity,
} from "@/lib/audit/types";

const HUBSPOT_API_BASE = "https://api.hubapi.com";

// ─── Users ──────────────────────────────────────────────────────────────────

interface SettingsUserResponse {
  results: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roleId?: string | null;
    roleIds?: string[];
    superAdmin: boolean;
    primaryTeamId?: string | null;
    secondaryTeamIds?: string[];
    createdAt?: string;
  }>;
  paging?: { next?: { after: string } };
}

/**
 * Récupère tous les utilisateurs via Settings API (paginé).
 * Requiert le scope `settings.users.read`.
 */
export async function fetchUsers(accessToken: string): Promise<HubSpotUser[]> {
  const client = new HubSpotClient(accessToken);
  const allUsers: HubSpotUser[] = [];
  let after: string | undefined;

  do {
    const path = after
      ? `/settings/v3/users/?limit=100&after=${after}`
      : "/settings/v3/users/?limit=100";

    const data = await client.get<SettingsUserResponse>(path);

    for (const u of data.results) {
      allUsers.push({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: u.roleId ?? null,
        roleIds: u.roleIds,
        superAdmin: u.superAdmin,
        primaryTeamId: u.primaryTeamId ?? null,
        secondaryTeamIds: u.secondaryTeamIds ?? [],
        createdAt: u.createdAt,
      });
    }

    after = data.paging?.next?.after;
  } while (after);

  return allUsers;
}

// ─── Teams ──────────────────────────────────────────────────────────────────

interface SettingsTeamsResponse {
  results: Array<{
    id: string;
    name: string;
    userIds?: string[];
    secondaryUserIds?: string[];
  }>;
}

/**
 * Récupère toutes les équipes via Settings API.
 * Requiert le scope `settings.users.read`.
 */
export async function fetchTeams(accessToken: string): Promise<HubSpotTeam[]> {
  const client = new HubSpotClient(accessToken);
  const data = await client.get<SettingsTeamsResponse>("/settings/v3/users/teams");

  return data.results.map((t) => ({
    id: t.id,
    name: t.name,
    userIds: t.userIds ?? [],
    secondaryUserIds: t.secondaryUserIds ?? [],
  }));
}

// ─── Roles ──────────────────────────────────────────────────────────────────

interface SettingsRolesResponse {
  results: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Récupère tous les rôles via Settings API.
 * Requiert le scope `settings.users.read`.
 */
export async function fetchRoles(accessToken: string): Promise<HubSpotRole[]> {
  const client = new HubSpotClient(accessToken);
  const data = await client.get<SettingsRolesResponse>("/settings/v3/users/roles");

  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

// ─── Login History (Enterprise only) ────────────────────────────────────────

interface LoginHistoryResponse {
  results: Array<{
    id: string;
    email: string;
    loginAt: string;
    loginSucceeded: boolean;
  }>;
  paging?: { next?: { after: string } };
}

/**
 * Tente de récupérer l'historique de connexion (Enterprise only).
 * Retourne null si 403/404 (mode non-Enterprise détecté).
 * Requiert le scope `account-info.security.read`.
 */
export async function fetchLoginHistory(
  accessToken: string,
): Promise<LoginActivity[] | null> {
  try {
    const res = await fetch(
      `${HUBSPOT_API_BASE}/account-info/v3/activity/login?limit=200`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (res.status === 403 || res.status === 404) {
      // Mode non-Enterprise — fallback silencieux
      return null;
    }

    if (!res.ok) {
      // Autre erreur — fallback silencieux aussi
      return null;
    }

    const data: LoginHistoryResponse = await res.json();
    return data.results.map((a) => ({
      id: a.id,
      email: a.email,
      loginAt: a.loginAt,
      loginSucceeded: a.loginSucceeded,
    }));
  } catch {
    return null;
  }
}

// ─── Owners ─────────────────────────────────────────────────────────────────

interface OwnersResponse {
  results: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt?: string;
    archived: boolean;
  }>;
  paging?: { next?: { after: string } };
}

/**
 * Récupère tous les owners actifs (non archivés).
 * Requiert le scope `crm.objects.owners.read`.
 */
export async function fetchOwners(accessToken: string): Promise<HubSpotOwner[]> {
  const client = new HubSpotClient(accessToken);
  const allOwners: HubSpotOwner[] = [];
  let after: string | undefined;

  do {
    const path = after
      ? `/crm/v3/owners/?archived=false&limit=100&after=${after}`
      : "/crm/v3/owners/?archived=false&limit=100";

    const data = await client.get<OwnersResponse>(path);

    for (const o of data.results) {
      allOwners.push({
        id: o.id,
        email: o.email,
        firstName: o.firstName,
        lastName: o.lastName,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        archived: o.archived,
      });
    }

    after = data.paging?.next?.after;
  } while (after);

  return allOwners;
}
