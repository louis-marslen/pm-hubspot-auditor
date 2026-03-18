interface SeveritySectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function SeveritySection({ title, count, children }: SeveritySectionProps) {
  if (count === 0) return null;

  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-sm font-medium text-gray-100">{title}</h3>
        <span className="text-[11px] text-gray-500">{count} règle{count !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {children}
      </div>
    </section>
  );
}
