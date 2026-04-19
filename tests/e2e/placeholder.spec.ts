import { expect, test } from "../../frontend/testing/playwright-test";

test.describe("SQS MVP", () => {
  test("fuehrt vom Splash-Screen bis ins Dashboard", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Dein produktives Pet-Abenteuer beginnt.",
      }),
    ).toBeVisible();
    await page.waitForURL("**/auth");

    await page.getByLabel("E-Mail").fill("demo@sqs.app");
    await page.getByLabel("Passwort").fill("cozyfocus");
    await page
      .getByRole("button", { name: "Einloggen und weitermachen" })
      .click();

    await page.waitForURL("**/dashboard");
    await expect(
      page.getByRole("heading", { name: "Dein Fokus-Zuhause" }),
    ).toBeVisible();
    await expect(page.getByText("Deine Aufgaben")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pet fuettern" }),
    ).toBeVisible();
  });
});
