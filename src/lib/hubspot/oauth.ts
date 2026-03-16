const HUBSPOT_OAUTH_BASE = "https://app.hubspot.com/oauth/authorize";
const HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";
const HUBSPOT_TOKEN_INFO_URL = "https://api.hubapi.com/oauth/v1/access-tokens";
const HUBSPOT_REVOKE_URL = "https://api.hubapi.com/oauth/v1/token/revoke";

// Scopes read-only requis pour l'audit HubSpot
const SCOPES = [
  "crm.objects.contacts.read",
  "crm.objects.companies.read",
  "crm.objects.deals.read",
  "crm.objects.leads.read",
  "crm.schemas.contacts.read",
  "crm.schemas.companies.read",
  "crm.schemas.deals.read",
  "automation",
  "oauth",
  "settings.users.read",
  "crm.objects.owners.read",
  "account-info.security.read",
].join(" ");

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TokenInfo {
  hub_id: number;
  hub_domain: string;
  user: string;
  scopes: string[];
}

export function buildAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI!,
    scope: SCOPES,
    state,
  });
  return `${HUBSPOT_OAUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(HUBSPOT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI!,
      code,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Échec échange code OAuth: ${res.status} ${body}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(HUBSPOT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Échec refresh token: ${res.status} ${body}`);
  }
  return res.json();
}

/** Best-effort : ne lève pas d'erreur si HubSpot refuse la révocation. */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(HUBSPOT_REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // Best-effort — la suppression locale se fait quoi qu'il arrive
  }
}

export async function getTokenInfo(accessToken: string): Promise<TokenInfo> {
  const res = await fetch(`${HUBSPOT_TOKEN_INFO_URL}/${accessToken}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Échec récupération token info: ${res.status} ${body}`);
  }
  return res.json();
}
