"use client";

import { ArrowRight } from "lucide-react";
import type { DiagnosticCluster } from "@/lib/audit/types";

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

interface DiagnosticClusterCardProps {
  cluster: DiagnosticCluster;
  isActive: boolean;
  onClick: () => void;
}

export function DiagnosticClusterCard({ cluster, isActive, onClick }: DiagnosticClusterCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border rounded-lg p-2.5 px-3 transition-all group ${
        isActive
          ? "border-violet-500 bg-violet-500/[0.06]"
          : "border-gray-700 hover:border-gray-600 hover:bg-gray-850 hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
      }`}
    >
      {/* Top row: title + arrow */}
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[13.5px] font-medium text-gray-100 truncate">{cluster.titre}</p>
        <span
          className={`h-7 w-7 flex items-center justify-center rounded-md flex-shrink-0 transition-all ${
            isActive
              ? "border border-violet-500 bg-violet-500/20 text-violet-400 opacity-100"
              : "border border-gray-700 bg-gray-800 text-gray-400 opacity-0 group-hover:opacity-100"
          }`}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Bottom row: badges */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        {cluster.criticite && (
          <span
            className={`${criticiteStyles[cluster.criticite] ?? criticiteStyles["modéré"]} px-1.5 py-0.5 rounded-full text-[10.5px] whitespace-nowrap`}
          >
            {criticiteLabels[cluster.criticite] ?? cluster.criticite}
          </span>
        )}
        {cluster.domaines.map((d) => (
          <span
            key={d}
            className="text-[10.5px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded"
          >
            {d}
          </span>
        ))}
      </div>
    </button>
  );
}
