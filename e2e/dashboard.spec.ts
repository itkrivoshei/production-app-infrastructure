import { expect, test } from "@playwright/test";

const isPages = process.env.E2E_MODE !== "compose";
const route = (path: string) =>
  isPages ? `/production-app-infrastructure/#${path}` : path;

test("opens dashboard routes directly", async ({ page }) => {
  await page.goto(route("/metrics"));

  await expect(page.getByRole("heading", { name: "Metrics", exact: true })).toBeVisible();
  await expect(page).toHaveURL(isPages ? /#\/metrics$/ : /\/metrics$/);
});

test("provides all navigation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route("/"));
  await page.getByRole("button", { name: "Open navigation" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("link", { name: "Logs" }).click();

  await expect(page.getByRole("heading", { name: "Logs", exact: true })).toBeVisible();
  await expect(page).toHaveURL(isPages ? /#\/logs$/ : /\/logs$/);
});

test("serves API health through the local edge", async ({ request }) => {
  test.skip(isPages, "The GitHub Pages preview is frontend-only.");

  const response = await request.get("/api/health");

  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});
