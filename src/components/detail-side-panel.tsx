"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface DetailSidePanelProps {
  open: boolean;
  onClose: () => void;
  width?: number;
  headerLabel: string;
  headerLabelColor?: string;
  children: React.ReactNode;
  navigation?: {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
  };
}

export function DetailSidePanel({
  open,
  onClose,
  width = 480,
  headerLabel,
  headerLabelColor = "text-gray-500",
  children,
  navigation,
}: DetailSidePanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onClose();
      } else if (navigation) {
        if (e.key === "ArrowLeft" && navigation.current > 0) {
          navigation.onPrev();
        } else if (e.key === "ArrowRight" && navigation.current < navigation.total - 1) {
          navigation.onNext();
        }
      }
    },
    [open, onClose, navigation],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-250 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-gray-900 border-l border-gray-700 flex flex-col transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] max-[900px]:!w-full`}
        style={{
          width,
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <span className={`text-[11px] font-semibold uppercase tracking-wide ${headerLabelColor}`}>
            {headerLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer navigation */}
        {navigation && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 flex-shrink-0">
            <button
              type="button"
              onClick={navigation.onPrev}
              disabled={navigation.current <= 0}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Precedent</span>
            </button>
            <span className="text-xs text-gray-500">
              {navigation.current + 1} / {navigation.total}
            </span>
            <button
              type="button"
              onClick={navigation.onNext}
              disabled={navigation.current >= navigation.total - 1}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span>Suivant</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
