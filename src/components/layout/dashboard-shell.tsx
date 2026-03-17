"use client";

import { useRouter } from "next/navigation";
import { Topbar } from "@/components/ui/topbar";
import { ToastProvider } from "@/components/ui/toast";

interface DashboardShellProps {
  email: string;
  children: React.ReactNode;
}

export function DashboardShell({ email, children }: DashboardShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/login");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gray-950 pt-14">
        <Topbar variant="connected" email={email} onSignOut={handleSignOut} />
        <main className="flex-1 mx-auto w-full max-w-content px-6 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
