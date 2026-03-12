import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HubSpot Auditor",
  description: "Auditez et optimisez votre workspace HubSpot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
