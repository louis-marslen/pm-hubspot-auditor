import { CircleX, TriangleAlert, CircleCheck, Info } from "lucide-react";

interface AlertProps {
  type: "error" | "success" | "info" | "warning";
  children: React.ReactNode;
}

const config = {
  error: {
    bg: "bg-[rgba(239,68,68,0.08)]",
    border: "border-l-[3px] border-red-500",
    text: "text-red-300",
    Icon: CircleX,
  },
  warning: {
    bg: "bg-[rgba(245,158,11,0.08)]",
    border: "border-l-[3px] border-amber-500",
    text: "text-amber-300",
    Icon: TriangleAlert,
  },
  success: {
    bg: "bg-[rgba(34,197,94,0.08)]",
    border: "border-l-[3px] border-green-500",
    text: "text-green-300",
    Icon: CircleCheck,
  },
  info: {
    bg: "bg-[rgba(59,130,246,0.08)]",
    border: "border-l-[3px] border-blue-500",
    text: "text-blue-300",
    Icon: Info,
  },
};

export function Alert({ type, children }: AlertProps) {
  const { bg, border, text, Icon } = config[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-md p-4 text-sm ${bg} ${border} ${text}`}
      role="alert"
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
