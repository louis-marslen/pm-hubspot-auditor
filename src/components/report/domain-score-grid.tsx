"use client";

import { getScoreColor } from "@/components/ui/score-circle";

interface DomainScoreGridDomain {
  id: string;
  label: string;
  score?: number | null;
  skipped?: boolean;
}

interface DomainScoreGridProps {
  domains: DomainScoreGridDomain[];
  activeDomain: string | null;
  onDomainClick: (id: string) => void;
}

export function DomainScoreGrid({ domains, activeDomain, onDomainClick }: DomainScoreGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {domains.map((d) => {
        const isActive = activeDomain === d.id;
        const hasScore = !d.skipped && d.score != null;

        return (
          <button
            key={d.id}
            type="button"
            onClick={() => !d.skipped && onDomainClick(d.id)}
            className={`border rounded-lg p-2.5 px-3 text-left transition-colors ${
              d.skipped ? "cursor-default opacity-60" : "cursor-pointer hover:border-gray-600 hover:bg-gray-850"
            } ${
              isActive
                ? "border-violet-500 bg-violet-500/[0.06]"
                : "border-gray-700"
            }`}
          >
            <p className="text-[10.5px] text-gray-400 truncate">{d.label}</p>
            <p className={`text-lg font-medium tabular-nums ${hasScore ? "text-gray-100" : "text-gray-500"}`}>
              {hasScore ? d.score : "—"}
            </p>
            <div className="h-[3px] rounded-full bg-gray-700 mt-1.5">
              {hasScore && (
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${d.score}%`,
                    backgroundColor: getScoreColor(d.score!),
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
