"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { RecommandationProject } from "@/lib/audit/types";

const impactStyles: Record<string, string> = {
  Fort: "bg-green-500/15 text-green-400",
  Moyen: "bg-amber-500/15 text-amber-400",
  Faible: "bg-gray-500/15 text-gray-400",
};

const prioriteStyles: Record<string, string> = {
  P1: "bg-red-500/15 text-red-400",
  P2: "bg-amber-500/15 text-amber-400",
  P3: "bg-gray-500/15 text-gray-400",
};

interface ProjectCardProps {
  project: RecommandationProject;
  index?: number;
  showIndex?: boolean;
}

export function ProjectCard({ project, index, showIndex }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg p-2.5 px-3 hover:bg-gray-850 hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-2">
        {showIndex && index != null && (
          <span className="text-sm font-semibold text-gray-500 mt-0.5 flex-shrink-0">
            #{index + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-100">{project.titre}</p>
          <p className="text-[12.5px] text-gray-400 leading-relaxed mt-0.5">
            {project.objectif}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className={`${impactStyles[project.niveau_impact] ?? impactStyles.Faible} text-[10.5px] px-1.5 py-0.5 rounded-full`}>
              {project.niveau_impact}
            </span>
            <span className="text-[10.5px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full">
              {project.taille}
            </span>
            <span className={`${prioriteStyles[project.priorite] ?? prioriteStyles.P3} text-[10.5px] px-1.5 py-0.5 rounded-full`}>
              {project.priorite}
            </span>
            {project.domaines.map((d) => (
              <span
                key={d}
                className="text-[10.5px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Expandable actions */}
          {project.actions_cles.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 mt-2 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
              <span>{expanded ? "Masquer les actions" : "Voir les actions"}</span>
            </button>
          )}
          {expanded && (
            <ul className="mt-2 space-y-1 text-[12px] text-gray-400">
              {project.actions_cles.map((action, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-gray-600 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
