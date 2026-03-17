"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Severity = "critique" | "avertissement" | "info" | "ok";

interface RuleListItemProps {
  title: string;
  description?: string;
  severity: Severity;
  domainLabel: string;
  count?: number;
  hasBusinessImpact?: boolean;
  expandable?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

const dotColors: Record<Severity, string> = {
  critique: "bg-red-400",
  avertissement: "bg-amber-400",
  info: "bg-blue-400",
  ok: "bg-green-400",
};

const badgeStyles: Record<Severity, string> = {
  critique: "bg-red-500/15 text-red-400",
  avertissement: "bg-amber-500/15 text-amber-400",
  info: "bg-blue-500/15 text-blue-400",
  ok: "text-green-400",
};

const badgeLabels: Record<Severity, string> = {
  critique: "Critique",
  avertissement: "Avertissement",
  info: "Info",
  ok: "OK",
};

export function RuleListItem({
  title,
  description,
  severity,
  domainLabel,
  count,
  hasBusinessImpact,
  expandable = severity !== "ok",
  defaultOpen = false,
  children,
}: RuleListItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOk = severity === "ok";

  return (
    <div
      className={`border border-gray-700 rounded-lg transition-colors ${
        isOk ? "opacity-50" : "hover:bg-gray-850 hover:border-gray-600"
      } ${expandable ? "cursor-pointer" : ""}`}
    >
      <div
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? open : undefined}
        onClick={() => expandable && setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (expandable && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex items-start gap-2.5 p-2.5 px-3"
      >
        {/* Dot */}
        <span
          className={`w-[5px] h-[5px] rounded-full mt-[6px] flex-shrink-0 ${dotColors[severity]}`}
        />

        {/* Center */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-100">{title}</p>
          {description && !isOk && (
            <p className="text-[11.5px] text-gray-400 leading-relaxed mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex gap-2 mt-1 text-[10.5px] text-gray-500 items-center flex-wrap">
            {/* Severity badge */}
            {isOk ? (
              <span className={badgeStyles.ok}>{badgeLabels.ok}</span>
            ) : (
              <span
                className={`${badgeStyles[severity]} px-1.5 py-0.5 rounded-full`}
              >
                {badgeLabels[severity]}
              </span>
            )}
            <span>{domainLabel}</span>
            {hasBusinessImpact && (
              <span className="text-amber-400">Impact business</span>
            )}
          </div>
        </div>

        {/* Right: count + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isOk && count != null && count > 0 && (
            <span className="text-[11px] text-gray-400 bg-gray-850 px-2 py-0.5 rounded-full tabular-nums">
              {count}
            </span>
          )}
          {expandable && (
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expandable && open && children && (
        <div className="border-t border-gray-700 px-3 pt-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
