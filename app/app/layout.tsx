import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { GeoProvider } from "@/lib/geo-context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Village Market — Real people. Real goods. Right here.",
  description:
    "A local-only marketplace for North Idaho makers, growers, and creators. Every seller personally verified. No dropshipping, no algorithms.",
  openGraph: {
    title: "Village Market — Real people. Real goods. Right here.",
    description:
      "A local-only marketplace for North Idaho makers, growers, and creators. Every seller personally verified.",
    url: "https://market.village-collective.com",
    siteName: "Village Market",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <GeoProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </GeoProvider>
      </body>
    </html>
  );
}
