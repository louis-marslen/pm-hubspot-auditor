import { redirect } from "next/navigation";

// Workspaces page has been merged into /dashboard and /settings
export default function WorkspacesPage() {
  redirect("/dashboard");
}
