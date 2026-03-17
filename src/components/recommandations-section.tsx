"use client";

import type { RecommandationProject } from "@/lib/audit/types";
import { ProjectCard } from "@/components/project-card";

interface RecommandationsSectionProps {
  roadmap: RecommandationProject[];
  backlog: RecommandationProject[];
}

export function RecommandationsSection({ roadmap, backlog }: RecommandationsSectionProps) {
  const total = roadmap.length + backlog.length;
  if (total === 0) return null;

  return (
    <section id="recommandations">
      <div className="flex items-baseline gap-1.5 mb-3">
        <h2 className="text-sm font-medium text-gray-100">Recommandations</h2>
        <span className="text-[11px] text-gray-500">{total} projets</span>
      </div>
      <div className="flex flex-col gap-4">
        {roadmap.length > 0 && (
          <div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <h3 className="text-xs font-medium text-gray-300">Roadmap — Projets prioritaires</h3>
              <span className="text-[11px] text-gray-500">{roadmap.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {roadmap.map((p, i) => (
                <ProjectCard key={i} project={p} index={i} showIndex />
              ))}
            </div>
          </div>
        )}
        {backlog.length > 0 && (
          <div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <h3 className="text-xs font-medium text-gray-300">Backlog</h3>
              <span className="text-[11px] text-gray-500">{backlog.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {backlog.map((p, i) => (
                <ProjectCard key={i} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
