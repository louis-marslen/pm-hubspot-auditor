interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

const sizes = {
  sm: { size: 32, stroke: 3, font: "text-xs font-bold" },
  md: { size: 48, stroke: 4, font: "text-[15px] font-semibold" },
  lg: { size: 120, stroke: 6, font: "text-display" },
};

export function ScoreCircle({ score, size = "md", className = "" }: ScoreCircleProps) {
  const { size: dim, stroke, font } = sizes[size];
  const color = getScoreColor(score);
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-700"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-800 ease-out"
        />
      </svg>
      <span
        className={`absolute tabular-nums text-gray-50 ${font}`}
      >
        {score}
      </span>
    </div>
  );
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Bon";
  if (score >= 50) return "À améliorer";
  return "Critique";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-[rgba(34,197,94,0.12)]";
  if (score >= 70) return "bg-[rgba(34,197,94,0.08)]";
  if (score >= 50) return "bg-[rgba(245,158,11,0.08)]";
  return "bg-[rgba(239,68,68,0.08)]";
}
