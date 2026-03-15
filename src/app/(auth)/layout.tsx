"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/ui/topbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const rightLink =
    pathname === "/register"
      ? { label: "Se connecter", href: "/login" }
      : { label: "Créer un compte", href: "/register" };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Topbar variant="auth" rightLink={rightLink} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-form">
          {children}
        </div>
      </main>
    </div>
  );
}
