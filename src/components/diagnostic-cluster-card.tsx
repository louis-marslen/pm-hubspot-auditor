"use client";

import type { DiagnosticCluster } from "@/lib/audit/types";

const criticiteStyles: Record<string, string> = {
  critique: "bg-red-500/15 text-red-400",
  "élevé": "bg-amber-500/15 text-amber-400",
  "modéré": "bg-blue-500/15 text-blue-400",
};

const criticiteLabels: Record<string, string> = {
  critique: "Critique",
  "élevé": "Élevé",
  "modéré": "Modéré",
};

export function DiagnosticClusterCard({ cluster }: { cluster: DiagnosticCluster }) {
  return (
    <div className="border border-gray-700 rounded-lg p-2.5 px-3 hover:bg-gray-850 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-100">{cluster.titre}</p>
        <span
          className={`${criticiteStyles[cluster.criticite] ?? criticiteStyles["modéré"]} px-1.5 py-0.5 rounded-full text-[10.5px] whitespace-nowrap flex-shrink-0`}
        >
          {criticiteLabels[cluster.criticite] ?? cluster.criticite}
        </span>
      </div>
      <p className="text-[12.5px] text-gray-400 leading-relaxed mt-1">
        {cluster.description}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap mt-2">
        {cluster.domaines.map((d) => (
          <span
            key={d}
            className="text-[10.5px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded"
          >
            {d}
          </span>
        ))}
      </div>
      {cluster.regles_sources.length > 0 && (
        <p className="text-[11px] text-gray-500 mt-1.5">
          Règles : {cluster.regles_sources.join(", ")}
        </p>
      )}
    </div>
  );
}
