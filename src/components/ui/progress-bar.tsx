interface ProgressBarProps {
  value: number;
  threshold?: number;
  colorClass?: string;
  className?: string;
}

export function ProgressBar({
  value,
  threshold,
  colorClass,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const aboveThreshold = threshold !== undefined ? clamped >= threshold : true;
  const fillColor = colorClass ?? (aboveThreshold ? "bg-green-500" : "bg-amber-500");

  return (
    <div className={`relative h-1.5 w-full rounded-full bg-gray-800 ${className}`}>
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${fillColor}`}
        style={{ width: `${clamped}%` }}
      />
      {threshold !== undefined && (
        <div
          className="absolute top-[-2px] bottom-[-2px] w-px bg-gray-500"
          style={{ left: `${threshold}%` }}
        />
      )}
    </div>
  );
}
