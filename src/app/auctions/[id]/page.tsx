import type { Metadata } from "next";
import { AuctionDetail } from "@/components/ui/auction-detail";

export const metadata: Metadata = {
  title: "Auction detail",
};

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuctionDetail auctionId={id} />;
}
