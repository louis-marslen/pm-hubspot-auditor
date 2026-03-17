interface ReportLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ReportLayout({ sidebar, children }: ReportLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {sidebar}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 ml-0 lg:ml-[200px] px-6 pt-6 pb-6 flex flex-col gap-4">
        {children}
      </main>
    </div>
  );
}
