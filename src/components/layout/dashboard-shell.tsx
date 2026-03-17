"use client";

import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ReportSidebarProvider } from "@/components/layout/report-sidebar-context";
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
      <ReportSidebarProvider>
        <div className="min-h-screen flex bg-gray-950">
          <AppSidebar email={email} onSignOut={handleSignOut} />
          <main className="flex-1 ml-[220px] px-6 py-6">
            {children}
          </main>
        </div>
      </ReportSidebarProvider>
    </ToastProvider>
  );
}
