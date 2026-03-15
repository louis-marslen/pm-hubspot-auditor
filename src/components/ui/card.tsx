interface CardProps {
  variant?: "standard" | "elevated" | "colored" | "dashed";
  colorClass?: string;
  hover?: boolean;
  padding?: "compact" | "standard";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const baseClasses = "rounded-lg";

const variantClasses = {
  standard: "bg-gray-900 border border-gray-700",
  elevated: "bg-gray-850 border border-gray-600",
  colored: "border",
  dashed: "bg-transparent border border-dashed border-gray-600",
};

const paddingClasses = {
  compact: "p-5",
  standard: "p-6",
};

export function Card({
  variant = "standard",
  colorClass,
  hover = false,
  padding = "standard",
  children,
  className = "",
  onClick,
}: CardProps) {
  const hoverClasses = hover
    ? "cursor-pointer transition-colors duration-150 hover:border-gray-600 hover:bg-gray-850"
    : "";

  const colorBg = variant === "colored" && colorClass ? colorClass : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${colorBg} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
