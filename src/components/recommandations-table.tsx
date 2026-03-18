"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { RecommandationProject } from "@/lib/audit/types";
import { DetailSidePanel } from "@/components/detail-side-panel";

interface RecommandationsTableProps {
  roadmap: RecommandationProject[];
  backlog: RecommandationProject[];
}

const prioriteStyles: Record<string, string> = {
  P1: "bg-red-500/[0.12] text-red-400",
  P2: "bg-amber-500/[0.12] text-amber-400",
  P3: "bg-gray-500/[0.12] text-gray-400",
};

const impactStyles: Record<string, string> = {
  Fort: "bg-green-500/[0.12] text-green-400",
  Moyen: "bg-amber-500/[0.12] text-amber-400",
  Faible: "bg-gray-500/[0.12] text-gray-400",
};

export function RecommandationsTable({ roadmap, backlog }: RecommandationsTableProps) {
  const [activeTab, setActiveTab] = useState<"roadmap" | "backlog">("roadmap");
  const [activeProject, setActiveProject] = useState<{ tab: "roadmap" | "backlog"; index: number } | null>(null);
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());

  const total = roadmap.length + backlog.length;
  const currentList = activeTab === "roadmap" ? roadmap : backlog;

  const activeItem = activeProject && activeProject.tab === activeTab
    ? currentList[activeProject.index]
    : null;

  // Flat list for navigation within active tab
  const flatNavigation = useMemo(
    () =>
      activeProject
        ? {
            current: activeProject.index,
            total: currentList.length,
            onPrev: () => {
              if (activeProject.index > 0) {
                setActiveProject({ tab: activeTab, index: activeProject.index - 1 });
              }
            },
            onNext: () => {
              if (activeProject.index < currentList.length - 1) {
                setActiveProject({ tab: activeTab, index: activeProject.index + 1 });
              }
            },
          }
        : undefined,
    [activeProject, activeTab, currentList.length],
  );

  const toggleAction = (key: string) => {
    setCheckedActions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (total === 0) return null;

  const panelLabel = activeProject
    ? activeProject.tab === "roadmap"
      ? `Roadmap #${activeProject.index + 1}`
      : "Backlog"
    : "";

  return (
    <section id="recommandations">
      {/* Section header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="text-sm font-medium text-gray-100">Recommandations</h3>
        <span className="text-[11px] text-gray-500">{total} projets</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 mb-0">
        {(
          [
            { key: "roadmap" as const, label: "Roadmap", count: roadmap.length },
            { key: "backlog" as const, label: "Backlog", count: backlog.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setActiveProject(null);
            }}
            className={`pb-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-violet-500 text-gray-100"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-0">
        {/* Table header */}
        <div className="grid grid-cols-[36px_1fr_100px_90px_70px_160px] max-[1000px]:grid-cols-[36px_1fr_90px_80px] bg-gray-950 px-3 py-2 rounded-t-lg">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">#</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Projet</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Priorité</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Impact</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 max-[1000px]:hidden">Taille</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-600 max-[1000px]:hidden">Domaines</span>
        </div>

        {/* Rows */}
        {currentList.map((project, index) => {
          const isActive = activeProject?.tab === activeTab && activeProject?.index === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                setActiveProject(isActive ? null : { tab: activeTab, index })
              }
              className={`w-full grid grid-cols-[36px_1fr_100px_90px_70px_160px] max-[1000px]:grid-cols-[36px_1fr_90px_80px] px-3 min-h-[52px] items-center border-b border-gray-800 group transition-colors text-left ${
                isActive
                  ? "bg-violet-500/[0.06] border-violet-500/20"
                  : "hover:bg-gray-850"
              }`}
            >
              {/* Index */}
              <span className="text-xs text-gray-500">
                {activeTab === "roadmap" ? `#${index + 1}` : "·"}
              </span>

              {/* Title + arrow */}
              <div className="flex items-center gap-2 pr-2 py-2">
                <span className="text-sm text-gray-200 truncate">{project.titre}</span>
                <ArrowRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-opacity ${
                    isActive
                      ? "text-violet-400 opacity-100"
                      : "text-gray-500 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </div>

              {/* Priority */}
              <div>
                <span className={`${prioriteStyles[project.priorite] ?? prioriteStyles.P3} text-[10.5px] px-1.5 py-0.5 rounded-full`}>
                  {project.priorite}
                </span>
              </div>

              {/* Impact */}
              <div>
                <span className={`${impactStyles[project.niveau_impact] ?? impactStyles.Faible} text-[10.5px] px-1.5 py-0.5 rounded-full`}>
                  {project.niveau_impact}
                </span>
              </div>

              {/* Taille (hidden < 1000px) */}
              <div className="max-[1000px]:hidden">
                <span className="text-[10.5px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full">
                  {project.taille}
                </span>
              </div>

              {/* Domaines (hidden < 1000px) */}
              <div className="flex gap-1 flex-wrap max-[1000px]:hidden">
                {project.domaines.slice(0, 2).map((d) => (
                  <span key={d} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                    {d}
                  </span>
                ))}
                {project.domaines.length > 2 && (
                  <span className="text-[10px] text-gray-500">+{project.domaines.length - 2}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Side panel */}
      <DetailSidePanel
        open={activeItem !== null}
        onClose={() => setActiveProject(null)}
        width={520}
        headerLabel={panelLabel}
        headerLabelColor="text-violet-400"
        navigation={flatNavigation}
      >
        {activeItem && (
          <div className="space-y-6">
            {/* Title + objectif */}
            <div>
              <h3 className="text-lg font-medium text-gray-100">{activeItem.titre}</h3>
              <p className="text-sm text-gray-400 mt-1">{activeItem.objectif}</p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-950 rounded-lg p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Priorité</p>
                <span className={`${prioriteStyles[activeItem.priorite] ?? prioriteStyles.P3} text-xs px-2 py-0.5 rounded-full`}>
                  {activeItem.priorite}
                </span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Impact</p>
                <span className={`${impactStyles[activeItem.niveau_impact] ?? impactStyles.Faible} text-xs px-2 py-0.5 rounded-full`}>
                  {activeItem.niveau_impact}
                </span>
              </div>
              <div className="bg-gray-950 rounded-lg p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Taille</p>
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                  {activeItem.taille}
                </span>
              </div>
            </div>

            {/* Domaines */}
            {activeItem.domaines.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Domaines concernés
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.domaines.map((d) => (
                    <span key={d} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Impact attendu */}
            {activeItem.impact_attendu && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Impact attendu
                </p>
                <p className="text-sm text-gray-300 leading-relaxed">{activeItem.impact_attendu}</p>
              </div>
            )}

            {/* Actions checklist */}
            {activeItem.actions_cles.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Actions à réaliser
                </p>
                <div className="space-y-1.5">
                  {activeItem.actions_cles.map((action, i) => {
                    const key = `${activeProject?.tab}-${activeProject?.index}-${i}`;
                    const checked = checkedActions.has(key);

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAction(key);
                        }}
                        className="flex items-start gap-2.5 w-full text-left group/action"
                      >
                        <span
                          className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            checked
                              ? "bg-violet-500 border-violet-500 text-white"
                              : "border-gray-600 group-hover/action:border-gray-500"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        <span
                          className={`text-sm transition-colors ${
                            checked ? "text-gray-500 line-through" : "text-gray-300"
                          }`}
                        >
                          {action}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailSidePanel>
    </section>
  );
}
