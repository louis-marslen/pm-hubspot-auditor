"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AuditProgressTracker } from "@/components/audit/audit-progress-tracker";

interface AuditPageClientProps {
  auditId: string;
  portalName?: string | null;
  initialStatus?: "running" | "failed";
  errorMessage?: string | null;
}

/**
 * Client wrapper pour la page d'audit en cours.
 * Affiche le tracker de progression, puis recharge la page (SSR) quand l'audit est terminé
 * pour afficher le rapport complet rendu côté serveur.
 */
export function AuditPageClient({
  auditId,
  portalName,
  initialStatus = "running",
  errorMessage,
}: AuditPageClientProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  const handleComplete = useCallback(() => {
    // Transition fade-out du tracker → rechargement SSR pour le rapport complet
    setTransitioning(true);
    setTimeout(() => {
      router.refresh();
    }, 200);
  }, [router]);

  return (
    <div
      className={`transition-opacity duration-200 ease-in ${
        transitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      <AuditProgressTracker
        auditId={auditId}
        portalName={portalName}
        onComplete={handleComplete}
      />
    </div>
  );
}
