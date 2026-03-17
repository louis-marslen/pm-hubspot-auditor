interface SeveritySectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function SeveritySection({ title, count, children }: SeveritySectionProps) {
  if (count === 0) return null;

  return (
    <section>
      <div className="flex items-baseline gap-1.5 mb-2">
        <h2 className="text-sm font-medium text-gray-100">{title}</h2>
        <span className="text-[11px] text-gray-500">{count} règle{count !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {children}
      </div>
    </section>
  );
}
