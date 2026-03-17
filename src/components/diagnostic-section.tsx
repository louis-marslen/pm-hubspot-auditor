"use client";

import type { AIDiagnostic } from "@/lib/audit/types";
import { DiagnosticClusterCard } from "@/components/diagnostic-cluster-card";

interface DiagnosticSectionProps {
  diagnostic: AIDiagnostic["diagnostic"];
}

function SubSection({ title, children, count }: { title: string; children: React.ReactNode; count: number }) {
  if (count === 0) return null;
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <h3 className="text-xs font-medium text-gray-300">{title}</h3>
        <span className="text-[11px] text-gray-500">{count}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {children}
      </div>
    </div>
  );
}

export function DiagnosticSection({ diagnostic }: DiagnosticSectionProps) {
  const { forces, faiblesses, risques } = diagnostic;
  const total = forces.length + faiblesses.length + risques.length;
  if (total === 0) return null;

  return (
    <section id="diagnostic">
      <div className="flex items-baseline gap-1.5 mb-3">
        <h2 className="text-sm font-medium text-gray-100">Diagnostic</h2>
        <span className="text-[11px] text-gray-500">{total} observations</span>
      </div>
      <div className="flex flex-col gap-4">
        <SubSection title="Forces" count={forces.length}>
          {forces.map((c, i) => <DiagnosticClusterCard key={i} cluster={c} />)}
        </SubSection>
        <SubSection title="Faiblesses" count={faiblesses.length}>
          {faiblesses.map((c, i) => <DiagnosticClusterCard key={i} cluster={c} />)}
        </SubSection>
        <SubSection title="Risques" count={risques.length}>
          {risques.map((c, i) => <DiagnosticClusterCard key={i} cluster={c} />)}
        </SubSection>
      </div>
    </section>
  );
}
