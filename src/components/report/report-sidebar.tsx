"use client";

import { useState } from "react";
import { getScoreColor } from "@/components/ui/score-circle";
import { LayoutDashboard, Share2, ExternalLink, Menu, X } from "lucide-react";

interface SidebarDomain {
  id: string;
  label: string;
  score?: number | null;
  skipped?: boolean;
}

interface ReportSidebarProps {
  domains: SidebarDomain[];
  activeDomain: string | null;
  onDomainSelect: (id: string | null) => void;
  isPublic?: boolean;
  shareToken?: string | null;
  className?: string;
}

function SidebarItem({
  label,
  active,
  onClick,
  right,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  right?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer transition-colors ${
        active
          ? "text-gray-100 font-medium bg-gray-850"
          : "text-gray-400 hover:bg-gray-850"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r bg-blue-500" />
      )}
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {right}
    </button>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
        {title}
      </p>
      {children}
    </div>
  );
}

export function ReportSidebar({
  domains,
  activeDomain,
  onDomainSelect,
  isPublic,
  shareToken,
  className = "",
}: ReportSidebarProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <nav
      className={`fixed top-0 bottom-0 left-0 w-[200px] bg-gray-900 border-r border-gray-700 overflow-y-auto z-30 ${className}`}
    >
      <div className="py-3">
        <SidebarSection title="Rapport">
          <SidebarItem
            label="Tableau de bord"
            active={activeDomain === null}
            onClick={() => onDomainSelect(null)}
            icon={<LayoutDashboard className="h-3.5 w-3.5 flex-shrink-0" />}
          />
        </SidebarSection>

        <SidebarSection title="Domaines">
          {domains.map((d) => (
            <SidebarItem
              key={d.id}
              label={d.label}
              active={activeDomain === d.id}
              onClick={() => !d.skipped && onDomainSelect(d.id)}
              right={
                d.skipped || d.score == null ? (
                  <span className="text-[11px] text-gray-500">—</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: getScoreColor(d.score) }}
                    />
                    <span className="text-[11px] tabular-nums text-gray-400">
                      {d.score}
                    </span>
                  </span>
                )
              }
            />
          ))}
        </SidebarSection>

        <SidebarSection title="Actions">
          {!isPublic && shareToken && (
            <SidebarItem
              label={copied ? "Lien copié !" : "Partager"}
              active={false}
              onClick={handleCopyLink}
              icon={<Share2 className="h-3.5 w-3.5 flex-shrink-0" />}
            />
          )}
          {isPublic && (
            <a
              href="/register"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              Lancer votre audit
            </a>
          )}
        </SidebarSection>
      </div>
    </nav>
  );
}

// Mobile sidebar wrapper
export function MobileSidebarToggle({
  domains,
  activeDomain,
  onDomainSelect,
  isPublic,
  shareToken,
}: ReportSidebarProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(id: string | null) {
    onDomainSelect(id);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors mb-3"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-4 w-4" />
        <span>Navigation</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative">
            <ReportSidebar
              domains={domains}
              activeDomain={activeDomain}
              onDomainSelect={handleSelect}
              isPublic={isPublic}
              shareToken={shareToken}
              className="translate-x-0 transition-transform duration-200"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 left-[208px] p-1 text-gray-400 hover:text-gray-200"
              aria-label="Fermer la navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
