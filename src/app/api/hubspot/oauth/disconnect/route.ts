import { decrypt } from "@/lib/crypto";
import { revokeToken } from "@/lib/hubspot/oauth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let connectionId: string;
  try {
    const body = await request.json();
    connectionId = body.connectionId;
    if (!connectionId) throw new Error("connectionId manquant");
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  // RLS garantit que l'utilisateur ne peut accéder qu'à ses propres connexions
  const { data: connection, error: fetchError } = await supabase
    .from("hubspot_connections")
    .select("id, refresh_token")
    .eq("id", connectionId)
    .single();

  if (fetchError || !connection) {
    return NextResponse.json({ error: "Connexion introuvable" }, { status: 404 });
  }

  // Révocation best-effort
  try {
    const decryptedRefreshToken = decrypt(connection.refresh_token);
    await revokeToken(decryptedRefreshToken);
  } catch {
    // Ne bloque pas la déconnexion si la révocation échoue
  }

  const { error: deleteError } = await supabase
    .from("hubspot_connections")
    .delete()
    .eq("id", connectionId);

  if (deleteError) {
    console.error("Erreur suppression hubspot_connections:", deleteError);
    return NextResponse.json({ error: "Erreur lors de la déconnexion" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
