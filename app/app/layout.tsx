import type { Metadata } from "next";
import { Fraunces, DM_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { GeoProvider } from "@/lib/geo-context";
import { BagProvider } from "@/lib/bag-context";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import IntroPopup from "@/components/IntroPopup";

// Fraunces — the craft/story voice. Optical sizing + soft axis give it warmth
// a default Playfair never has.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// Spline Sans Mono — the ledger voice: prices, mileage, dates, payment chips.
const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${splineMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <GeoProvider>
          <BagProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <IntroPopup />
          </BagProvider>
        </GeoProvider>
      </body>
    </html>
  );
}
