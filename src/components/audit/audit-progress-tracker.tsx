"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  ListTree,
  Users,
  Building2,
  Workflow,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader,
  Circle,
  RefreshCw,
  Shield,
} from "lucide-react";
import type { DomainProgress } from "@/lib/audit/types";

interface AuditDomainSelection {
  selected: string[];
  available: string[];
  skipped_reasons?: Record<string, string>;
}

interface StatusResponse {
  status: "running" | "completed" | "failed";
  portalName: string | null;
  error: string | null;
  domains: Record<string, DomainProgress> | null;
  llmSummary: { status: string; error?: string } | null;
  globalProgress: number;
  auditDomains: AuditDomainSelection | null;
}

interface AuditProgressTrackerProps {
  auditId: string;
  portalName?: string | null;
  onComplete: () => void;
}

// Mapping domaines → icônes Lucide + labels
const DOMAIN_CONFIG: Record<
  string,
  { icon: typeof ListTree; label: string }
> = {
  properties: { icon: ListTree, label: "Propriétés" },
  contacts: { icon: Users, label: "Contacts" },
  companies: { icon: Building2, label: "Companies" },
  workflows: { icon: Workflow, label: "Workflows" },
  users: { icon: Shield, label: "Utilisateurs & Équipes" },
};

const STEP_LABELS: Record<string, string> = {
  fetching: "Récupération des données",
  analyzing: "Analyse en cours",
  scoring: "Scoring et recommandations",
};

const DOMAIN_ORDER = ["properties", "contacts", "companies", "workflows", "users"];

function formatCount(count: number): string {
  return count.toLocaleString("fr-FR");
}

export function AuditProgressTracker({
  auditId,
  portalName,
  onComplete,
}: AuditProgressTrackerProps) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [pollError, setPollError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit/${auditId}/status`);
      if (!res.ok) return;
      const json: StatusResponse = await res.json();
      setData(json);
      setPollError(false);

      if (json.status === "completed" && !completedRef.current) {
        completedRef.current = true;
        // Attendre 1s pour que l'utilisateur voie toutes les étapes ✓
        setTimeout(() => onComplete(), 1000);
      }

      // Arrêter le polling si terminé ou échoué
      if (json.status !== "running" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch {
      // Perte de connexion — le polling continue silencieusement
      setPollError(true);
    }
  }, [auditId, onComplete]);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  const handleRetry = () => {
    window.location.href = "/dashboard";
  };

  const displayName = data?.portalName ?? portalName ?? "votre workspace";
  const progress = data?.globalProgress ?? 0;
  const domains = data?.domains ?? null;
  const llmSummary = data?.llmSummary ?? null;

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-[640px]">
        <h2 className="text-lg font-semibold text-gray-100 mb-5">
          Audit en cours — {displayName}
        </h2>

        {/* Domaines — only show selected domains (from progress keys or all if no selection) */}
        <div className="space-y-5">
          {DOMAIN_ORDER.filter((key) => !domains || key in domains).map((key) => {
            const config = DOMAIN_CONFIG[key];
            const domain = domains?.[key];
            if (!config) return null;

            return (
              <DomainRow
                key={key}
                icon={config.icon}
                label={config.label}
                domain={domain ?? null}
              />
            );
          })}
        </div>

        {/* Séparateur avant LLM */}
        <div className="border-t border-gray-700 my-5" />

        {/* LLM Summary step */}
        <div className="flex items-center gap-3">
          <StepIcon
            status={
              llmSummary?.status === "completed"
                ? "completed"
                : llmSummary?.status === "running"
                  ? "running"
                  : llmSummary?.status === "error"
                    ? "error"
                    : "pending"
            }
          />
          <Sparkles className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-200 font-medium">
            Résumé exécutif
          </span>
          {llmSummary?.status === "running" && (
            <span className="text-xs text-gray-500 ml-auto">En cours</span>
          )}
          {llmSummary?.status === "completed" && (
            <span className="text-xs text-green-500 ml-auto">OK</span>
          )}
          {llmSummary?.status === "error" && (
            <span className="text-xs text-red-400 ml-auto">Erreur</span>
          )}
        </div>

        {/* Barre de progression */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar
              value={progress * 100}
              colorClass="bg-brand-500"
              className="h-1.5"
            />
          </div>
          <span className="text-sm font-medium text-gray-400 w-10 text-right tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* État d'erreur globale */}
        {data?.status === "failed" && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-red-400">
              {data.error ?? "L'audit a échoué. Veuillez réessayer."}
            </p>
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function DomainRow({
  icon: Icon,
  label,
  domain,
}: {
  icon: typeof ListTree;
  label: string;
  domain: DomainProgress | null;
}) {
  const status = domain?.status ?? "pending";
  const steps = ["fetching", "analyzing", "scoring"];

  // Domaine avec 0 éléments : complété avec itemCount = 0
  const isExcluded =
    status === "completed" &&
    domain?.itemCount === 0;

  return (
    <div>
      {/* Domain header */}
      <div className="flex items-center gap-3">
        <StepIcon status={status} />
        <Icon className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-200 font-medium">{label}</span>
        {status === "completed" && !isExcluded && (
          <span className="text-xs text-green-500 ml-auto">OK</span>
        )}
        {isExcluded && (
          <span className="text-xs text-gray-500 ml-auto">Exclu</span>
        )}
        {status === "running" && (
          <span className="text-xs text-brand-400 ml-auto">En cours</span>
        )}
        {status === "error" && (
          <span
            className="text-xs text-red-400 ml-auto max-w-[200px] truncate"
            title={domain?.error ?? undefined}
          >
            Erreur
          </span>
        )}
      </div>

      {/* Domaine exclu : message inline */}
      {isExcluded && (
        <div className="ml-11 mt-2">
          <span className="text-xs text-gray-500">
            Aucun élément détecté — domaine exclu
          </span>
        </div>
      )}

      {/* Sub-steps (show only when running or completed or error, and not excluded) */}
      {status !== "pending" && !isExcluded && (
        <div className="ml-11 mt-2 space-y-1.5">
          {steps.map((step) => {
            const isCompleted = domain?.completedSteps?.includes(step) ?? false;
            const isCurrent = domain?.currentStep === step;
            const stepStatus = isCompleted
              ? "completed"
              : isCurrent
                ? "running"
                : status === "error"
                  ? "pending"
                  : "pending";

            return (
              <div key={step} className="flex items-center gap-2">
                <StepIcon status={stepStatus} size="sm" />
                <span
                  className={`text-xs ${
                    isCompleted
                      ? "text-gray-400"
                      : isCurrent
                        ? "text-gray-200"
                        : "text-gray-500"
                  }`}
                >
                  {STEP_LABELS[step]}
                  {step === "fetching" &&
                    isCompleted &&
                    domain?.itemCount != null && (
                      <span className="text-gray-500 ml-1">
                        ({formatCount(domain.itemCount)})
                      </span>
                    )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepIcon({
  status,
  size = "md",
}: {
  status: "pending" | "running" | "completed" | "error";
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  switch (status) {
    case "completed":
      return <CheckCircle2 className={`${sizeClass} text-green-500`} />;
    case "running":
      return (
        <Loader
          className={`${sizeClass} text-brand-500 animate-spin motion-reduce:animate-none`}
        />
      );
    case "error":
      return <XCircle className={`${sizeClass} text-red-400`} />;
    case "pending":
    default:
      return <Circle className={`${sizeClass} text-gray-500`} />;
  }
}
