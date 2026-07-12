import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AssetFlow — Enterprise Asset & Resource Management",
  description:
    "AssetFlow is a modern enterprise ERP for tracking assets, managing allocations, resource bookings, maintenance, and compliance audits across your organization.",
  keywords: ["asset management", "ERP", "resource management", "inventory", "enterprise"],
  authors: [{ name: "AssetFlow Team" }],
  openGraph: {
    title: "AssetFlow — Enterprise Asset & Resource Management",
    description: "Track, manage and optimize your enterprise assets in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
