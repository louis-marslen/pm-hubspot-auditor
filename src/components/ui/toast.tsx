"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
};

const iconColors = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
  warning: "text-amber-400",
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 max-w-[360px] rounded-lg bg-gray-850 border border-gray-600 shadow-lg px-4 py-3 text-sm text-gray-100 animate-in slide-in-from-bottom-2 fade-in duration-200"
            >
              <Icon className={`h-4 w-4 shrink-0 ${iconColors[t.type]}`} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
