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
  Check,
  Minus,
} from "lucide-react";

const DOMAIN_ICONS: Record<AuditDomainId, typeof ListTree> = {
  properties: ListTree,
  contacts: Users,
  companies: Building2,
  workflows: Workflow,
  users: Shield,
  deals: TrendingUp,
};

interface AuditDomainSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (selectedDomains: AuditDomainId[]) => void;
  loading?: boolean;
}

export function AuditDomainSelector({
  isOpen,
  onClose,
  onLaunch,
  loading = false,
}: AuditDomainSelectorProps) {
  // Initialize with all implemented domains selected
  const [selected, setSelected] = useState<Set<AuditDomainId>>(() => {
    const initial = new Set<AuditDomainId>();
    for (const d of AUDIT_DOMAINS) {
      if (d.implemented) initial.add(d.id);
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
        // Deselect all optional
        for (const d of availableDomains) {
          next.delete(d.id);
        }
      } else {
        // Select all optional
        for (const d of availableDomains) {
          next.add(d.id);
        }
      }
      return next;
    });
  }, [allAvailableSelected, availableDomains]);

  const selectedCount = selected.size;

  const handleLaunch = () => {
    onLaunch(Array.from(selected));
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Configurer votre audit"
      actions={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleLaunch} loading={loading} disabled={loading}>
            Lancer l&apos;audit ({selectedCount} domaine{selectedCount !== 1 ? "s" : ""})
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Sélectionnez les domaines à analyser
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
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
      </div>
    </label>
  );
}
