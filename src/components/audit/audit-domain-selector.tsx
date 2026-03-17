"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AUDIT_DOMAINS,
  type AuditDomainId,
  type AuditDomainMeta,
} from "@/lib/audit/types";
import {
  ListTree,
  Users,
  Building2,
  Workflow,
  Shield,
  TrendingUp,
  UserPlus,
  Check,
  Minus,
  ChevronLeft,
} from "lucide-react";

const DOMAIN_ICONS: Record<AuditDomainId, typeof ListTree> = {
  properties: ListTree,
  contacts: Users,
  companies: Building2,
  workflows: Workflow,
  users: Shield,
  deals: TrendingUp,
  leads: UserPlus,
};

export interface AuditWorkspace {
  id: string;
  portal_id: string;
  portal_name: string | null;
  hub_domain: string | null;
  expired?: boolean;
}

interface AuditDomainSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (connectionId: string, selectedDomains: AuditDomainId[]) => void;
  loading?: boolean;
  workspaces: AuditWorkspace[];
}

export function AuditDomainSelector({
  isOpen,
  onClose,
  onLaunch,
  loading = false,
  workspaces,
}: AuditDomainSelectorProps) {
  const [step, setStep] = useState<"workspace" | "domains">("workspace");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  // Initialize with all implemented domains selected, except those with defaultSelected: false
  const [selected, setSelected] = useState<Set<AuditDomainId>>(() => {
    const initial = new Set<AuditDomainId>();
    for (const d of AUDIT_DOMAINS) {
      if (d.implemented && d.defaultSelected !== false) initial.add(d.id);
    }
    return initial;
  });

  const availableDomains = AUDIT_DOMAINS.filter((d) => d.implemented && !d.required);
  const allAvailableSelected = availableDomains.every((d) => selected.has(d.id));

  const toggleDomain = useCallback((id: AuditDomainId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allAvailableSelected) {
        for (const d of availableDomains) {
          next.delete(d.id);
        }
      } else {
        for (const d of availableDomains) {
          next.add(d.id);
        }
      }
      return next;
    });
  }, [allAvailableSelected, availableDomains]);

  const selectedCount = selected.size;

  const handleSelectWorkspace = (wsId: string) => {
    setSelectedWorkspace(wsId);
    setStep("domains");
  };

  const handleBack = () => {
    setStep("workspace");
  };

  const handleClose = () => {
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setStep("workspace");
      setSelectedWorkspace(null);
    }, 200);
  };

  const handleLaunch = () => {
    if (!selectedWorkspace) return;
    onLaunch(selectedWorkspace, Array.from(selected));
  };

  const activeWorkspaces = workspaces.filter((ws) => !ws.expired);
  const selectedWs = workspaces.find((ws) => ws.id === selectedWorkspace);

  if (step === "workspace") {
    return (
      <Modal
        open={isOpen}
        onClose={handleClose}
        title="Lancer un audit"
        actions={
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-400 mb-4">
            Sur quel workspace souhaitez-vous lancer l&apos;audit ?
          </p>
          {activeWorkspaces.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">
              Aucun workspace actif.{" "}
              <a href="/api/hubspot/oauth/initiate" className="text-brand-500 hover:text-brand-400">
                Connecter un workspace
              </a>
            </p>
          )}
          {activeWorkspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => handleSelectWorkspace(ws.id)}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-gray-800 border border-gray-700 cursor-pointer"
            >
              <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200">
                  {ws.portal_name ?? `Portal ${ws.portal_id}`}
                </p>
                {ws.hub_domain && (
                  <p className="text-xs text-gray-500">{ws.hub_domain}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Configurer votre audit"
      actions={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleLaunch} loading={loading} disabled={loading}>
            Lancer l&apos;audit ({selectedCount} domaine{selectedCount !== 1 ? "s" : ""})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm text-gray-400">
            {selectedWs?.portal_name ?? "Workspace"} — Sélectionnez les domaines à analyser
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="ml-auto text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
          >
            {allAvailableSelected ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
        </div>

        <div className="space-y-1">
          {AUDIT_DOMAINS.map((domain) => (
            <DomainCheckbox
              key={domain.id}
              domain={domain}
              checked={selected.has(domain.id)}
              onToggle={toggleDomain}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function DomainCheckbox({
  domain,
  checked,
  onToggle,
}: {
  domain: AuditDomainMeta;
  checked: boolean;
  onToggle: (id: AuditDomainId) => void;
}) {
  const Icon = DOMAIN_ICONS[domain.id];
  const isDisabled = domain.required || !domain.implemented;

  return (
    <label
      className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
        isDisabled
          ? "cursor-default opacity-60"
          : "cursor-pointer hover:bg-gray-800"
      }`}
    >
      {/* Checkbox */}
      <span className="mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={isDisabled}
          onChange={() => !isDisabled && onToggle(domain.id)}
        />
        <span
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            checked
              ? "bg-brand-500 border-brand-500"
              : "bg-gray-800 border-gray-600"
          } ${isDisabled ? "opacity-70" : ""}`}
        >
          {checked && domain.required && (
            <Minus className="h-3.5 w-3.5 text-white" />
          )}
          {checked && !domain.required && (
            <Check className="h-3.5 w-3.5 text-white" />
          )}
        </span>
      </span>

      {/* Icon + content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-200">{domain.label}</span>
          {domain.required && (
            <Badge variant="brand">Obligatoire</Badge>
          )}
          {!domain.implemented && (
            <Badge variant="info">Bientôt</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 ml-6">{domain.description}</p>
        {domain.tooltip && (
          <p className="text-xs text-amber-400/70 mt-0.5 ml-6">{domain.tooltip}</p>
        )}
      </div>
    </label>
  );
}
