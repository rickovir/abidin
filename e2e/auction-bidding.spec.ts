import { expect, test } from "@playwright/test";

/**
 * Critical E2E journey (spec §6):
 * listing → live auction detail → valid bid → too-low rejection →
 * competitor outbid → force end → winner state.
 *
 * The demo panel (bottom-right "D" button) provides deterministic controls
 * so no random timers are needed.
 */

const LIVE_TITLE = "Classic Omega Constellation ’68";

test.describe("Auction bidding journey", () => {
  test("browse, bid, get outbid, end", async ({ page }) => {
    // 1. Listing renders seeded auctions.
    await page.goto("/auctions");
    await expect(page.getByRole("heading", { name: /live auctions/i })).toBeVisible();
    await expect(page.getByText(LIVE_TITLE).first()).toBeVisible();

    // 2. Open a live auction.
    await page.getByRole("link", { name: new RegExp(LIVE_TITLE) }).first().click();
    await expect(page.getByText("Current price", { exact: false })).toBeVisible();

    // 3. Submit a too-low bid → rejection feedback.
    const input = page.getByLabel(/your bid/i);
    await input.fill("1000000");
    await page.getByRole("button", { name: /place bid/i }).click();
    await expect(page.getByText(/bid is below the minimum/i)).toBeVisible();

    // 4. Submit a valid bid → accepted + appears in history.
    await input.fill("");
    await input.fill("12000000");
    await page.getByRole("button", { name: /place bid/i }).click();
    await expect(page.getByText(/bid placed/i)).toBeVisible();
    await expect(page.getByText("Rp 12.000.000").first()).toBeVisible();

    // 5. Trigger a competitor bid via demo panel → outbid feedback.
    await page.getByRole("button", { name: /toggle demo controls/i }).click();
    await page.getByRole("button", { name: /trigger one competitor bid/i }).click();
    await expect(page.getByText(/outbid/i).first()).toBeVisible({ timeout: 15_000 });

    // 6. Force auction end → bidding disabled + winner shown.
    await page.getByRole("button", { name: /force auction end/i }).click();
    await expect(page.getByText(/auction ended/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /place bid/i })).toHaveCount(0);
  });

  test("listing filters work", async ({ page }) => {
    await page.goto("/auctions");
    await page.getByRole("button", { name: /^ended$/i }).click();
    await expect(page.getByText(LIVE_TITLE)).toHaveCount(0);
    await page.getByRole("button", { name: /^upcoming$/i }).click();
    await expect(page.getByText("Vintage Batik Tulis Pekalongan")).toBeVisible();
  });

  test("unknown auction shows not-found state", async ({ page }) => {
    await page.goto("/auctions/does-not-exist");
    await expect(page.getByText(/auction not found/i)).toBeVisible();
  });

  test("no console errors during the demo", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/auctions");
    await page.getByRole("link", { name: new RegExp(LIVE_TITLE) }).first().click();
    await page.waitForTimeout(1500);

    expect(errors).toEqual([]);
  });
});
