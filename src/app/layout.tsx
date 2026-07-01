import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Kenya Fuel Intelligence",
  description:
    "Real-time fuel price intelligence for Kenya — track Super Petrol, Diesel, and Kerosene prices, historical trends, and market insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-gray-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted flex flex-col sm:flex-row justify-between gap-2">
            <span>
              &copy; {new Date().getFullYear()} Kenya Fuel Intelligence. Sample
              data for demonstration purposes only.
            </span>
            <span>Data refreshed monthly · Source: EPRA (mock)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
