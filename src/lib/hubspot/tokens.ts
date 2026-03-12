import { decrypt, encrypt } from "@/lib/crypto";
import { refreshAccessToken } from "@/lib/hubspot/oauth";
import { createClient } from "@/lib/supabase/server";

interface Connection {
  id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
}

const REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Retourne un access token valide et déchiffré.
 * Rafraîchit proactivement si expiry < 10 min.
 */
export async function getValidAccessToken(connection: Connection): Promise<string> {
  const decryptedAccessToken = decrypt(connection.access_token);

  const expiresAt = connection.token_expires_at
    ? new Date(connection.token_expires_at).getTime()
    : null;
  const needsRefresh = expiresAt === null || expiresAt - Date.now() < REFRESH_THRESHOLD_MS;

  if (!needsRefresh) {
    return decryptedAccessToken;
  }

  // Refresh
  const decryptedRefreshToken = decrypt(connection.refresh_token);
  const tokens = await refreshAccessToken(decryptedRefreshToken);

  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);

  const supabase = await createClient();
  await supabase
    .from("hubspot_connections")
    .update({
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: newExpiresAt,
    })
    .eq("id", connection.id);

  return tokens.access_token;
}
