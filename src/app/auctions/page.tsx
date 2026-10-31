import type { Metadata } from "next";
import { AuctionListing } from "@/components/ui/auction-listing";

export const metadata: Metadata = {
  title: "Auctions",
};

export default function AuctionsPage() {
  return <AuctionListing />;
}
