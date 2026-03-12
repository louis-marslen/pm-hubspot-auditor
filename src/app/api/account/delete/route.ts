import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json();
  if (body.userId !== user.id) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  // Delete HubSpot connections (cascades from RLS policy)
  await supabase.from("hubspot_connections").delete().eq("user_id", user.id);

  // Delete user via admin client (requires SERVICE_ROLE_KEY)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte." },
      { status: 500 }
    );
  }

  // Sign out the user
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
