"use client";

import { useState, useMemo } from "react";
import type { AIDiagnostic, DiagnosticCluster } from "@/lib/audit/types";
import { DiagnosticClusterCard } from "@/components/diagnostic-cluster-card";
import { DetailSidePanel } from "@/components/detail-side-panel";

interface DiagnosticGridProps {
  diagnostic: AIDiagnostic["diagnostic"];
}

type ClusterType = "forces" | "faiblesses" | "risques";

const criticiteOrder: Record<string, number> = {
  critique: 0,
  "élevé": 1,
  "modéré": 2,
};

const columnConfig: { key: ClusterType; label: string; dotColor: string; labelColor: string }[] = [
  { key: "forces", label: "Forces", dotColor: "bg-green-400", labelColor: "text-green-400" },
  { key: "faiblesses", label: "Faiblesses", dotColor: "bg-amber-400", labelColor: "text-amber-400" },
  { key: "risques", label: "Risques", dotColor: "bg-red-400", labelColor: "text-red-400" },
];

const criticiteStyles: Record<string, string> = {
  critique: "bg-red-500/[0.12] text-red-400",
  "élevé": "bg-amber-500/[0.12] text-amber-400",
  "modéré": "bg-blue-500/[0.12] text-blue-400",
};

const criticiteLabels: Record<string, string> = {
  critique: "Critique",
  "élevé": "Élevé",
  "modéré": "Modéré",
};

function sortByCriticite(clusters: DiagnosticCluster[]): DiagnosticCluster[] {
  return [...clusters].sort(
    (a, b) => (criticiteOrder[a.criticite] ?? 3) - (criticiteOrder[b.criticite] ?? 3),
  );
}

function countByCriticite(clusters: DiagnosticCluster[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of clusters) {
    counts[c.criticite] = (counts[c.criticite] ?? 0) + 1;
  }
  return counts;
}

// Build flat list for side panel navigation
function buildFlatList(diagnostic: AIDiagnostic["diagnostic"]) {
  const items: { type: ClusterType; index: number; cluster: DiagnosticCluster }[] = [];
  for (const col of columnConfig) {
    const sorted = sortByCriticite(diagnostic[col.key]);
    sorted.forEach((cluster, index) => {
      items.push({ type: col.key, index, cluster });
    });
  }
  return items;
}

export function DiagnosticGrid({ diagnostic }: DiagnosticGridProps) {
  const [activeCluster, setActiveCluster] = useState<{ type: ClusterType; index: number } | null>(null);

  const { forces, faiblesses, risques } = diagnostic;
  const total = forces.length + faiblesses.length + risques.length;

  const sortedColumns = useMemo(
    () => ({
      forces: sortByCriticite(forces),
      faiblesses: sortByCriticite(faiblesses),
      risques: sortByCriticite(risques),
    }),
    [forces, faiblesses, risques],
  );

  const flatList = useMemo(() => buildFlatList(diagnostic), [diagnostic]);
  const activeFlatIndex = activeCluster
    ? flatList.findIndex((item) => item.type === activeCluster.type && item.index === activeCluster.index)
    : -1;
  const activeItem = activeFlatIndex >= 0 ? flatList[activeFlatIndex] : null;
  const activeColumnConfig = activeItem ? columnConfig.find((c) => c.key === activeItem.type) : null;

  if (total === 0) return null;

  return (
    <section id="diagnostic">
      {/* Section header */}
      <div className="flex items-baseline gap-2 mb-4">
        <h3 className="text-sm font-medium text-gray-100">Diagnostic</h3>
        <span className="text-[11px] text-gray-500">{total} observations</span>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-4">
        {columnConfig.map((col) => {
          const sorted = sortedColumns[col.key];
          const counts = countByCriticite(sorted);

          return (
            <div key={col.key}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <span className="text-xs font-medium text-gray-300">{col.label}</span>
                {col.key !== "forces" &&
                  Object.entries(counts).map(([level, count]) => (
                    <span
                      key={level}
                      className={`${criticiteStyles[level] ?? ""} text-[10px] px-1.5 py-0.5 rounded-full`}
                    >
                      {count} {criticiteLabels[level] ?? level}
                    </span>
                  ))}
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {sorted.map((cluster, index) => (
                  <DiagnosticClusterCard
                    key={index}
                    cluster={cluster}
                    isActive={activeCluster?.type === col.key && activeCluster?.index === index}
                    onClick={() =>
                      setActiveCluster(
                        activeCluster?.type === col.key && activeCluster?.index === index
                          ? null
                          : { type: col.key, index },
                      )
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side panel */}
      <DetailSidePanel
        open={activeItem !== null}
        onClose={() => setActiveCluster(null)}
        width={480}
        headerLabel={activeColumnConfig?.label ?? ""}
        headerLabelColor={activeColumnConfig?.labelColor ?? "text-gray-500"}
        navigation={
          flatList.length > 0
            ? {
                current: activeFlatIndex,
                total: flatList.length,
                onPrev: () => {
                  if (activeFlatIndex > 0) {
                    const prev = flatList[activeFlatIndex - 1];
                    setActiveCluster({ type: prev.type, index: prev.index });
                  }
                },
                onNext: () => {
                  if (activeFlatIndex < flatList.length - 1) {
                    const next = flatList[activeFlatIndex + 1];
                    setActiveCluster({ type: next.type, index: next.index });
                  }
                },
              }
            : undefined
        }
      >
        {activeItem && (
          <div className="space-y-6">
            {/* Label + title + criticité */}
            <div>
              <span className={`text-[11px] font-semibold uppercase tracking-wide ${activeColumnConfig?.labelColor}`}>
                {activeColumnConfig?.label}
              </span>
              <div className="flex items-start gap-2 mt-1">
                <h3 className="text-lg font-medium text-gray-100">{activeItem.cluster.titre}</h3>
                <span
                  className={`${criticiteStyles[activeItem.cluster.criticite] ?? ""} px-1.5 py-0.5 rounded-full text-[10.5px] whitespace-nowrap mt-1`}
                >
                  {criticiteLabels[activeItem.cluster.criticite] ?? activeItem.cluster.criticite}
                </span>
              </div>
            </div>

            {/* Analyse */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Analyse</p>
              <p className="text-sm text-gray-300 leading-relaxed">{activeItem.cluster.description}</p>
            </div>

            {/* Domaines concernés */}
            {activeItem.cluster.domaines.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Domaines concernés
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.cluster.domaines.map((d) => (
                    <span key={d} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Règles sources */}
            {activeItem.cluster.regles_sources.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Règles sources
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.cluster.regles_sources.map((r) => (
                    <span key={r} className="text-xs font-mono bg-violet-500/[0.1] text-violet-400 px-2 py-1 rounded">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailSidePanel>
    </section>
  );
}
