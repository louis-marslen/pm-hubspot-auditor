import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
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
    <html lang="fr" className={GeistSans.variable}>
      <body className="min-h-screen bg-gray-950 text-gray-200 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
