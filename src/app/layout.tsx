import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader, SiteFooter } from "@/components/layout/site-chrome";
import { DemoPanel } from "@/components/feedback/demo-panel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ABIDIN — Auction & Bid Engine",
    template: "%s · ABIDIN",
  },
  description:
    "A polished, frontend-only auction simulator: browse live auctions, place bids, and watch simulated realtime activity.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen bg-[#faf9f7] font-sans text-stone-900 antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <DemoPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}
