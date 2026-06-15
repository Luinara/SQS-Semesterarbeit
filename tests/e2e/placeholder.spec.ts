import { expect, test } from "../../frontend/testing/playwright-test";

test.describe("SQS Quality Companion", () => {
  test("fuehrt vom Login bis ins Quality-Dashboard", async ({ page }) => {
    await page.addInitScript(() => {
      globalThis.localStorage.clear();
    });

    await page.goto("/auth", { waitUntil: "domcontentloaded", timeout: 10000 });

    await page.getByLabel("E-Mail").fill("demo@sqs.app");
    await page.getByLabel("Passwort").fill("cozyfocus");
    await page
      .getByRole("button", { name: "Einloggen und weitermachen" })
      .click();

    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Quality Companion Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("SQS Checkliste")).toBeVisible();
    await expect(page.getByText("SQS Quality Gate")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pokemon trainieren" }),
    ).toBeVisible();
  });
});
