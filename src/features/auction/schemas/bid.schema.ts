/**
 * Bid amount input parsing/validation. Money is integer IDR; the input is
 * free-form text so we normalise digits only ("1.500.000" → 1500000).
 */
export function parseBidAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isSafeInteger(value) || value <= 0) return null;
  return value;
}

export interface BidFieldValidation {
  valid: boolean;
  message: string | null;
}

export function validateBidAmount(
  amount: number | null,
  minimumNextBid: number
): BidFieldValidation {
  if (amount === null) {
    return { valid: false, message: "Enter a bid amount in rupiah." };
  }
  if (amount < minimumNextBid) {
    return {
      valid: false,
      message: "Bid is below the minimum next bid.",
    };
  }
  return { valid: true, message: null };
}
