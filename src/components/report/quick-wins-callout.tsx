interface QuickWinsCalloutProps {
  recommendations: string[];
}

export function QuickWinsCallout({ recommendations }: QuickWinsCalloutProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="p-3 px-4 bg-blue-500/10 border-l-[3px] border-blue-500 rounded-r-lg">
      <h3 className="text-xs font-medium text-blue-400 mb-1.5">
        Corrections rapides recommandées
      </h3>
      <ul className="space-y-1">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-[5px]" />
            <span className="text-xs text-gray-300">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
