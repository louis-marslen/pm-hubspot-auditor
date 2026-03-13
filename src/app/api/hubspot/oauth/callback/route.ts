import { encrypt } from "@/lib/crypto";
import { exchangeCodeForTokens, getTokenInfo } from "@/lib/hubspot/oauth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

function redirect(path: string) {
  return NextResponse.redirect(new URL(path, APP_URL));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;

  // Invalide le cookie immédiatement (usage unique)
  const response = redirect("/workspaces?error=state_invalid");
  response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });

  // Validation du state anti-CSRF
  if (!savedState || !state || state !== savedState) {
    return response;
  }

  // L'utilisateur a refusé l'accès sur HubSpot
  if (error === "access_denied" || !code) {
    return redirect("/workspaces?error=access_denied");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const tokenInfo = await getTokenInfo(tokens.access_token);

    // Dérive le nom du portail depuis le hub_domain (ex: "monentreprise.hubspot.com" → "monentreprise")
    const portalName = tokenInfo.hub_domain
      ? tokenInfo.hub_domain.replace(/\.hubspot\.com$/, "")
      : `Portal ${tokenInfo.hub_id}`;

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    // Upsert — la contrainte unique (user_id, portal_id) gère la reconnexion
    const { error: dbError } = await supabase.from("hubspot_connections").upsert(
      {
        user_id: user.id,
        portal_id: String(tokenInfo.hub_id),
        portal_name: portalName,
        hub_domain: tokenInfo.hub_domain,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,portal_id" }
    );

    if (dbError) {
      console.error("Erreur upsert hubspot_connections:", dbError);
      return redirect("/workspaces?error=db_error");
    }

    const successResponse = redirect("/workspaces?connected=true");
    successResponse.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
    return successResponse;
  } catch (err) {
    console.error("Erreur callback OAuth HubSpot:", err);
    return redirect("/workspaces?error=oauth_failed");
  }
}
