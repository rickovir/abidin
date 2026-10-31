import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader, SiteFooter } from "@/components/layout/site-chrome";
import { DemoPanel } from "@/components/feedback/demo-panel";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "abidin — Auction & Bid Index",
    template: "%s · abidin",
  },
  description:
    "A polished, frontend-only auction simulator: browse live auctions, place bids, and watch simulated realtime activity.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} dark`}>
      <body className="min-h-screen bg-surface-bg font-sans text-content-primary antialiased">
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
