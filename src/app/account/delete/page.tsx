import { redirect } from "next/navigation";

// Account deletion is now handled via modal in /settings
export default function DeleteAccountPage() {
  redirect("/settings");
}
