"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LayoutDashboard,
  Settings,
  ArrowLeft,
  Share2,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { getScoreColor } from "@/components/ui/score-circle";
import { useReportSidebar } from "@/components/layout/report-sidebar-context";

interface AppSidebarProps {
  email: string;
  onSignOut: () => void;
}

export function AppSidebar({ email, onSignOut }: AppSidebarProps) {
  const pathname = usePathname();
  const isAuditPage = pathname.startsWith("/audit/");
  const { state: reportState } = useReportSidebar();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[220px] bg-gray-900 border-r border-gray-700 z-40 flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-800">
        <div className="h-14 flex items-center gap-2.5 px-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-500 text-white text-xs font-bold shrink-0">
            H
          </div>
          <span className="text-[15px] font-semibold text-gray-50">
            HubSpot Auditor
          </span>
        </div>
        {isAuditPage && (
          <div className="px-3.5 pb-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour au dashboard</span>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation — dashboard pages */}
      {!isAuditPage && (
        <nav className="flex-1 overflow-y-auto px-2 pt-3 space-y-0.5">
          <NavItem
            href="/dashboard"
            label="Vue d'ensemble"
            icon={<LayoutGrid className="h-3.5 w-3.5 shrink-0" />}
            active={pathname === "/dashboard"}
          />
        </nav>
      )}

      {/* Navigation — audit report pages */}
      {isAuditPage && reportState && (
        <nav className="flex-1 overflow-y-auto py-3">
          <SidebarSection title="Rapport">
            <ReportNavItem
              label="Vue d'ensemble"
              active={reportState.activeDomain === null}
              onClick={() => reportState.onDomainSelect(null)}
              icon={<LayoutDashboard className="h-3.5 w-3.5 shrink-0" />}
            />
          </SidebarSection>

          {reportState.hasAIDiagnostic && (
            <SidebarSection title="Analyse IA">
              <ReportNavItem
                label="Diagnostic"
                active={false}
                onClick={() => {
                  reportState.onDomainSelect(null);
                  setTimeout(() => document.getElementById("diagnostic")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                icon={<Sparkles className="h-3.5 w-3.5 shrink-0" />}
              />
              <ReportNavItem
                label="Recommandations"
                active={false}
                onClick={() => {
                  reportState.onDomainSelect(null);
                  setTimeout(() => document.getElementById("recommandations")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                icon={<ListChecks className="h-3.5 w-3.5 shrink-0" />}
              />
            </SidebarSection>
          )}

          <SidebarSection title="Domaines">
            {reportState.domains.map((d) => (
              <ReportNavItem
                key={d.id}
                label={d.label}
                active={reportState.activeDomain === d.id}
                onClick={() => !d.skipped && reportState.onDomainSelect(d.id)}
                right={
                  d.skipped || d.score == null ? (
                    <span className="text-[11px] text-gray-500">—</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-[5px] h-[5px] rounded-full shrink-0"
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

          {reportState.shareToken && !reportState.isPublic && (
            <SidebarSection title="Actions">
              <ShareButton shareToken={reportState.shareToken} />
            </SidebarSection>
          )}
        </nav>
      )}

      {/* Spacer if audit page without report state (loading/progress) */}
      {isAuditPage && !reportState && <div className="flex-1" />}

      {/* Bottom section */}
      <div className="px-2 py-3 space-y-0.5 border-t border-gray-800">
        <NavItem
          href="/settings"
          label="Paramètres"
          icon={<Settings className="h-3.5 w-3.5 shrink-0" />}
          active={pathname === "/settings"}
        />
        <button
          type="button"
          onClick={onSignOut}
          className="w-full flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-gray-400 hover:bg-gray-850 transition-colors"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-900 text-brand-300 text-[10px] font-medium shrink-0">
            {email.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 text-left truncate">{email}</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer transition-colors ${
        active
          ? "text-gray-100 font-medium bg-gray-850"
          : "text-gray-400 hover:bg-gray-850"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1 bottom-1 w-[2.5px] rounded-r bg-blue-500" />
      )}
      {icon}
      <span>{label}</span>
    </Link>
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

function ReportNavItem({
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

function ShareButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <ReportNavItem
      label={copied ? "Lien copié !" : "Partager"}
      active={false}
      onClick={handleCopy}
      icon={<Share2 className="h-3.5 w-3.5 shrink-0" />}
    />
  );
}
