import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import {
  createConfig,
  type AppConfig,
  type AppMode,
} from "../src/config.js";

function testConfig(
  appMode: AppMode = "safe",
  overrides: Partial<AppConfig> = {},
): AppConfig {
  return {
    ...createConfig({
      APP_MODE: appMode,
      LOG_FORMAT: "json",
      LOG_LEVEL: "silent",
    }),
    ...overrides,
  };
}

async function withApp<T>(
  run: (app: Awaited<ReturnType<typeof buildApp>>) => Promise<T>,
  appMode: AppMode = "safe",
  overrides: Partial<AppConfig> = {},
): Promise<T> {
  const app = await buildApp(testConfig(appMode, overrides));

  try {
    return await run(app);
  } finally {
    await app.close();
  }
}

describe("DevOps Control Center API", () => {
  it.each([
    ["/health", "ok"],
    ["/ready", "ready"],
  ])("returns system status from %s", async (url, status) => {
    await withApp(async (app) => {
      const response = await app.inject({ method: "GET", url });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ status });
    });
  });

  it("returns release and overview metadata", async () => {
    await withApp(async (app) => {
      const version = await app.inject({ method: "GET", url: "/version" });
      const overview = await app.inject({ method: "GET", url: "/overview" });

      expect(version.json()).toMatchObject({
        service: "devops-control-center-api",
        version: "0.1.0",
        commit: "local",
        environment: "local",
      });
      expect(overview.json()).toMatchObject({
        health: "ok",
        readiness: "ready",
        mode: "safe",
        requests: expect.any(Number),
        http5xx: 0,
      });
    });
  });

  it("returns Prometheus metrics and OpenAPI documentation", async () => {
    await withApp(async (app) => {
      const metrics = await app.inject({ method: "GET", url: "/metrics" });
      const docs = await app.inject({ method: "GET", url: "/docs/json" });

      expect(metrics.statusCode).toBe(200);
      expect(metrics.body).toContain("http_requests_total");
      expect(metrics.body).toContain("app_info");
      expect(docs.json()).toMatchObject({
        openapi: "3.0.3",
        info: {
          title: "DevOps Control Center API",
          version: "0.1.0",
        },
      });
    });
  });

  it("does not register dangerous demo routes in safe mode", async () => {
    await withApp(async (app) => {
      for (const url of ["/load/cpu", "/load/errors", "/logs/generate"]) {
        const response = await app.inject({ method: "POST", url });
        expect(response.statusCode).toBe(404);
      }
    });
  });

  it("requires the explicit demo header in demo mode", async () => {
    await withApp(async (app) => {
      const forbidden = await app.inject({
        method: "POST",
        url: "/logs/generate",
        payload: {},
      });
      const allowed = await app.inject({
        method: "POST",
        url: "/logs/generate",
        headers: { "x-demo-action": "true" },
        payload: { message: "Test demo log" },
      });

      expect(forbidden.statusCode).toBe(403);
      expect(allowed.statusCode).toBe(200);
      expect(allowed.json()).toMatchObject({
        status: "ok",
        message: "Test demo log",
      });
    }, "demo");
  });

  it("rate limits demo actions across routes", async () => {
    await withApp(
      async (app) => {
        const headers = { "x-demo-action": "true" };
        const first = await app.inject({
          method: "POST",
          url: "/logs/generate",
          headers,
          payload: {},
        });
        const second = await app.inject({
          method: "POST",
          url: "/load/errors",
          headers,
        });

        expect(first.statusCode).toBe(200);
        expect(second.statusCode).toBe(429);
      },
      "demo",
      { demoRateLimit: 1 },
    );
  });

  it("runs CPU load outside the event loop and rejects concurrent load", async () => {
    await withApp(async (app) => {
      const headers = { "x-demo-action": "true" };
      const loadRequest = app.inject({
        method: "POST",
        url: "/load/cpu",
        headers,
        payload: { durationMs: 300 },
      });

      await new Promise((resolve) => setTimeout(resolve, 25));
      const startedAt = Date.now();
      const [health, concurrent] = await Promise.all([
        app.inject({ method: "GET", url: "/health" }),
        app.inject({
          method: "POST",
          url: "/load/cpu",
          headers,
          payload: { durationMs: 100 },
        }),
      ]);
      const healthElapsed = Date.now() - startedAt;
      const load = await loadRequest;

      expect(health.statusCode).toBe(200);
      expect(healthElapsed).toBeLessThan(150);
      expect(concurrent.statusCode).toBe(409);
      expect(load.statusCode).toBe(200);
    }, "demo");
  });

  it("normalizes unmatched routes in metric labels", async () => {
    await withApp(async (app) => {
      await app.inject({ method: "GET", url: "/missing/user-value?token=secret" });
      const metrics = await app.inject({ method: "GET", url: "/metrics" });

      expect(metrics.body).toContain('route="unmatched"');
      expect(metrics.body).not.toContain("user-value");
      expect(metrics.body).not.toContain("secret");
    });
  });

  it("reports HTTP 5xx counts through overview", async () => {
    await withApp(async (app) => {
      await app.inject({
        method: "POST",
        url: "/load/errors",
        headers: { "x-demo-action": "true" },
      });
      const overview = await app.inject({ method: "GET", url: "/overview" });

      expect(overview.json()).toMatchObject({
        http5xx: 1,
        errorRate: expect.any(Number),
      });
    }, "demo");
  });

  it("marks readiness unavailable during graceful shutdown", async () => {
    await withApp(async (app) => {
      app.runtimeState.shuttingDown = true;
      const response = await app.inject({ method: "GET", url: "/ready" });

      expect(response.statusCode).toBe(503);
      expect(response.json()).toMatchObject({
        status: "not_ready",
        checks: { api: "shutting_down" },
      });
    });
  });
});

describe("configuration validation", () => {
  it.each([
    [{ APP_MODE: "public" }, "APP_MODE"],
    [{ PORT: "0" }, "PORT"],
    [{ LOG_FORMAT: "text" }, "LOG_FORMAT"],
    [{ LOG_LEVEL: "verbose" }, "LOG_LEVEL"],
    [{ DEMO_RATE_LIMIT: "unlimited" }, "DEMO_RATE_LIMIT"],
  ])("rejects invalid environment values", (environment, expected) => {
    expect(() => createConfig(environment)).toThrow(expected);
  });
});
