"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarDomain {
  id: string;
  label: string;
  score?: number | null;
  skipped?: boolean;
}

interface ReportSidebarState {
  domains: SidebarDomain[];
  activeDomain: string | null;
  onDomainSelect: (id: string | null) => void;
  shareToken: string | null;
  isPublic: boolean;
}

interface ReportSidebarContextValue {
  state: ReportSidebarState | null;
  register: (state: ReportSidebarState) => void;
  unregister: () => void;
}

const ReportSidebarContext = createContext<ReportSidebarContextValue>({
  state: null,
  register: () => {},
  unregister: () => {},
});

export function ReportSidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReportSidebarState | null>(null);

  const register = useCallback((s: ReportSidebarState) => setState(s), []);
  const unregister = useCallback(() => setState(null), []);

  return (
    <ReportSidebarContext.Provider value={{ state, register, unregister }}>
      {children}
    </ReportSidebarContext.Provider>
  );
}

export function useReportSidebar() {
  return useContext(ReportSidebarContext);
}
