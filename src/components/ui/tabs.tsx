"use client";

import { useEffect, useRef, useState } from "react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  sticky?: boolean;
}

export function Tabs({ tabs, activeTab, onTabChange, sticky = false }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center gap-1 border-b border-gray-700 overflow-x-auto ${
        sticky ? "sticky top-0 z-30 bg-gray-950 py-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4)]" : ""
      }`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-tab-id={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "text-gray-50"
              : "text-gray-400 hover:text-gray-100"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-gray-800 px-1.5 py-0.5 text-caption text-gray-300">
              {tab.count}
            </span>
          )}
        </button>
      ))}
      <div
        className="absolute bottom-0 h-0.5 bg-brand-500 transition-all duration-200 ease-in-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
    </div>
  );
}
