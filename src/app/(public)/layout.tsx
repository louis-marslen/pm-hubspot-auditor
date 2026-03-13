// Layout minimal pour les pages publiques (rapport partagé sans authentification)
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <span className="text-lg font-semibold text-gray-900">HubSpot Auditor</span>
        </div>
      </header>
      {children}
    </div>
  );
}
