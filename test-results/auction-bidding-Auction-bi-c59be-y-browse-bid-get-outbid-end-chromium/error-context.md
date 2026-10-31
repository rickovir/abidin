# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auction-bidding.spec.ts >> Auction bidding journey >> browse, bid, get outbid, end
- Location: e2e/auction-bidding.spec.ts:15:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('alert').last()
Expected pattern: /below the minimum next bid/i
Received string:  "Auction detail · ABIDIN"
Timeout: 10000ms

Call log:
  - Expect "toHaveText" getByRole('alert').last() with timeout 10000ms
  - waiting for getByRole('alert').last()
    24 × locator resolved to <div role="alert" aria-live="assertive" id="__next-route-announcer__">Auction detail · ABIDIN</div>
       - unexpected value "Auction detail · ABIDIN"

```

```yaml
- alert: Auction detail · ABIDIN
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | /**
  4  |  * Critical E2E journey (spec §6):
  5  |  * listing → live auction detail → valid bid → too-low rejection →
  6  |  * competitor outbid → force end → winner state.
  7  |  *
  8  |  * Deterministic: the competitor simulator is PAUSED before bidding so no
  9  |  * random activity interferes; the outbid step uses the explicit trigger.
  10 |  */
  11 | 
  12 | const LIVE_TITLE = "Classic Omega Constellation ’68";
  13 | 
  14 | test.describe("Auction bidding journey", () => {
  15 |   test("browse, bid, get outbid, end", async ({ page }) => {
  16 |     // 1. Listing renders seeded auctions.
  17 |     await page.goto("/auctions");
  18 |     await expect(page.getByRole("heading", { name: /live auctions/i })).toBeVisible();
  19 |     await expect(page.getByText(LIVE_TITLE).first()).toBeVisible();
  20 | 
  21 |     // 2. Open a live auction.
  22 |     await page.getByRole("link", { name: new RegExp(LIVE_TITLE) }).first().click();
  23 |     await expect(page.getByText("Current price", { exact: false })).toBeVisible();
  24 | 
  25 |     // Deterministic mode: pause auto competitor activity first.
  26 |     await page.getByRole("button", { name: /toggle demo controls/i }).click();
  27 |     await page.getByRole("button", { name: /pause competitors/i }).click();
  28 |     await expect(page.getByText(/paused/i).first()).toBeVisible({ timeout: 10_000 });
  29 | 
  30 |     // 3. Submit a too-low bid → rejection feedback.
  31 |     const input = page.getByLabel(/your bid/i);
  32 |     await input.fill("1000000");
> 33 |     await expect(page.getByRole("alert").last()).toHaveText(/below the minimum next bid/i, { timeout: 10_000 });
     |                                                  ^ Error: expect(locator).toHaveText(expected) failed
  34 | 
  35 |     // 4. Submit a valid bid → accepted + appears in history.
  36 |     await input.fill("12000000");
  37 |     await expect(page.getByRole("button", { name: /place bid/i })).toBeEnabled({ timeout: 10_000 });
  38 |     await page.getByRole("button", { name: /place bid/i }).click();
  39 |     await expect(page.getByText(/bid placed/i)).toBeVisible({ timeout: 10_000 });
  40 |     await expect(page.getByText("Rp 12.000.000").first()).toBeVisible();
  41 | 
  42 |     // 5. Trigger a competitor bid via demo panel → outbid feedback.
  43 |     await page.getByRole("button", { name: /trigger one competitor bid/i }).click();
  44 |     await expect(page.getByText(/outbid/i).first()).toBeVisible({ timeout: 15_000 });
  45 | 
  46 |     // 6. Force auction end → bidding disabled + winner shown.
  47 |     await page.getByRole("button", { name: /force auction end/i }).click();
  48 |     await expect(page.getByText(/auction ended/i).first()).toBeVisible({ timeout: 15_000 });
  49 |     await expect(page.getByRole("button", { name: /place bid/i })).toHaveCount(0);
  50 |     await expect(page.getByText(/won by/i)).toBeVisible();
  51 |   });
  52 | 
  53 |   test("listing filters work", async ({ page }) => {
  54 |     await page.goto("/auctions");
  55 |     await page.getByRole("button", { name: /^ended$/i }).click();
  56 |     await expect(page.getByText(LIVE_TITLE)).toHaveCount(0);
  57 |     await page.getByRole("button", { name: /^upcoming$/i }).click();
  58 |     await expect(page.getByText("Vintage Batik Tulis Pekalongan")).toBeVisible();
  59 |   });
  60 | 
  61 |   test("unknown auction shows not-found state", async ({ page }) => {
  62 |     await page.goto("/auctions/does-not-exist");
  63 |     await expect(page.getByText(/auction not found/i)).toBeVisible();
  64 |   });
  65 | 
  66 |   test("no console errors during the demo", async ({ page }) => {
  67 |     const errors: string[] = [];
  68 |     page.on("console", (msg) => {
  69 |       if (msg.type() === "error") errors.push(msg.text());
  70 |     });
  71 |     page.on("pageerror", (err) => errors.push(String(err)));
  72 | 
  73 |     await page.goto("/auctions");
  74 |     await page.getByRole("link", { name: new RegExp(LIVE_TITLE) }).first().click();
  75 |     await page.waitForTimeout(1500);
  76 | 
  77 |     expect(errors).toEqual([]);
  78 |   });
  79 | });
  80 | 
```