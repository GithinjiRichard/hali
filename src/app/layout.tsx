import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CountryNotice from "@/components/CountryNotice";
import { ThemeProvider } from "@/components/ThemeProvider";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dataFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hali — Fuel & Energy Prices Across East Africa",
  description:
    "Hali tracks fuel and energy prices across East Africa in plain language — Super Petrol, Diesel and Kerosene prices, trends, and what's driving them, starting with Kenya.",
  openGraph: {
    title: "Hali — Fuel & Energy Prices Across East Africa",
    description:
      "Today's fuel prices, explained simply. Starting with Kenya, expanding across East Africa.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hali — Fuel & Energy Prices Across East Africa",
    description: "Today's fuel prices, explained simply.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
    { media: "(prefers-color-scheme: dark)", color: "#17140F" },
  ],
};

// Runs before React hydrates so the correct theme class is applied to <html>
// immediately — this avoids a light-then-dark (or dark-then-light) flash on
// load. Default is always light unless the person previously chose dark.
const themeInitScript = `
(function() {
  try {
    var stored = window.localStorage.getItem('hali-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${dataFont.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background dark:bg-backgroundDark text-ink dark:text-inkDark antialiased">
        <div className="bg-grain-overlay" aria-hidden="true" />
        <ThemeProvider>
          <CountryNotice />
          <Navbar />
          <main>{children}</main>
          <footer className="border-t border-border dark:border-borderDark mt-16 bg-surface dark:bg-surfaceDark">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-display font-semibold text-ink dark:text-inkDark">
                  Hali
                </span>
                <span className="text-xs text-muted dark:text-mutedDark max-w-md">
                  Fuel and energy price intelligence for East Africa, explained
                  simply. Sample data for demonstration purposes only.
                </span>
              </div>
              <div className="text-xs text-muted dark:text-mutedDark sm:text-right">
                <div>Data refreshed monthly &middot; Source: EPRA (mock)</div>
                <div>&copy; {new Date().getFullYear()} Hali</div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
