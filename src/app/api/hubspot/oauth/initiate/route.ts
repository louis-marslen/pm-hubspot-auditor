import { buildAuthorizationUrl } from "@/lib/hubspot/oauth";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const state = randomBytes(32).toString("base64url");
  const authUrl = buildAuthorizationUrl(state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300, // 5 minutes
    path: "/",
  });

  return response;
}
