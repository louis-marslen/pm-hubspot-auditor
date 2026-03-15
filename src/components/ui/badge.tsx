interface BadgeProps {
  variant?: "critique" | "avertissement" | "info" | "succes" | "neutre" | "brand";
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  critique:
    "bg-[rgba(239,68,68,0.12)] text-red-300 border border-[rgba(239,68,68,0.2)]",
  avertissement:
    "bg-[rgba(245,158,11,0.12)] text-amber-300 border border-[rgba(245,158,11,0.2)]",
  info:
    "bg-[rgba(59,130,246,0.12)] text-blue-300 border border-[rgba(59,130,246,0.2)]",
  succes:
    "bg-[rgba(34,197,94,0.12)] text-green-300 border border-[rgba(34,197,94,0.2)]",
  neutre:
    "bg-[rgba(255,255,255,0.06)] text-gray-300 border border-gray-700",
  brand:
    "bg-[rgba(249,115,22,0.12)] text-brand-300 border border-[rgba(249,115,22,0.2)]",
};

export function Badge({ variant = "neutre", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
