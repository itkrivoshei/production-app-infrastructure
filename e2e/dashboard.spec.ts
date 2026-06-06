import { expect, test } from "@playwright/test";

const isPages = process.env.E2E_MODE !== "compose";
const runtimeMode = process.env.E2E_RUNTIME_MODE;
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

test("matches demo controls to the runtime mode", async ({ page }) => {
  test.skip(isPages, "The static preview always provides simulated demo actions.");

  await page.goto("/load-test");

  if (runtimeMode === "safe") {
    await expect(page.getByText(/Demo actions are disabled in safe mode/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate CPU Load" })).toHaveCount(0);
    return;
  }

  await expect(page.getByRole("button", { name: "Generate CPU Load" })).toBeVisible();
});

test("shows the full local demo command in the static preview", async ({ page }) => {
  test.skip(!isPages, "Local Compose opens service links directly.");

  await page.goto(route("/docs"));
  await page.getByRole("button", { name: "Grafana" }).click();

  await expect(
    page.getByText(
      "COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml docker compose --profile observability up --build -d",
    ),
  ).toBeVisible();
});
