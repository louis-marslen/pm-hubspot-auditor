import { ReportSidebar } from "@/components/report/report-sidebar";

interface SidebarProps {
  domains: { id: string; label: string; score?: number | null; skipped?: boolean }[];
  activeDomain: string | null;
  onDomainSelect: (id: string | null) => void;
  isPublic?: boolean;
  shareToken?: string | null;
}

interface ReportLayoutProps {
  sidebar: SidebarProps | null;
  children: React.ReactNode;
}

export function ReportLayout({ sidebar, children }: ReportLayoutProps) {
  // Authenticated view: no sidebar in report layout (app sidebar handles it)
  if (!sidebar) {
    return (
      <div className="flex flex-col gap-4">
        {children}
      </div>
    );
  }

  // Public view: report sidebar is rendered inside the layout
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <ReportSidebar {...sidebar} />
      </div>
      <main className="flex-1 min-w-0 ml-0 lg:ml-[200px] px-6 pt-6 pb-6 flex flex-col gap-4">
        {children}
      </main>
    </div>
  );
}
