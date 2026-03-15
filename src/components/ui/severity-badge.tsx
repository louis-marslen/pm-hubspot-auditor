import { Badge } from "./badge";

interface SeverityBadgeProps {
  severity: "critique" | "avertissement" | "info" | "ok";
  className?: string;
}

const labels: Record<string, string> = {
  critique: "CRITIQUE",
  avertissement: "AVERT.",
  info: "INFO",
  ok: "OK",
};

const variants: Record<string, "critique" | "avertissement" | "info" | "succes"> = {
  critique: "critique",
  avertissement: "avertissement",
  info: "info",
  ok: "succes",
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant={variants[severity]} className={className}>
      {labels[severity]}
    </Badge>
  );
}
