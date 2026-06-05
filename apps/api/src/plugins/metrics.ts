import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import client from "prom-client";
import type { AppConfig } from "../config.js";

export type AppMetrics = {
  register: client.Registry;
  httpRequestsTotal: client.Counter<string>;
  httpRequestDurationSeconds: client.Histogram<string>;
  appErrorsTotal: client.Counter<string>;
  appLoadEventsTotal: client.Counter<string>;
  appInfo: client.Gauge<string>;
  summary: () => Promise<{
    requests: number;
    http5xx: number;
    errorRate: number;
  }>;
};

export function createMetrics(config: AppConfig): AppMetrics {
  const register = new client.Registry();

  client.collectDefaultMetrics({
    register,
    prefix: "node_",
  });

  const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register],
  });

  const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register],
  });

  const appErrorsTotal = new client.Counter({
    name: "app_errors_total",
    help: "Total number of demo application errors",
    labelNames: ["route", "type"],
    registers: [register],
  });

  const appLoadEventsTotal = new client.Counter({
    name: "app_load_events_total",
    help: "Total number of generated demo load events",
    labelNames: ["type"],
    registers: [register],
  });

  const appInfo = new client.Gauge({
    name: "app_info",
    help: "Application metadata",
    labelNames: ["service", "version", "commit", "environment"],
    registers: [register],
  });

  appInfo.set(
    {
      service: config.appName,
      version: config.appVersion,
      commit: config.commitSha,
      environment: config.appEnv,
    },
    1,
  );

  const summary = async () => {
    const values = (await httpRequestsTotal.get()).values;
    const requests = values.reduce((total, value) => total + value.value, 0);
    const http5xx = values
      .filter((value) => String(value.labels.status_code).startsWith("5"))
      .reduce((total, value) => total + value.value, 0);

    return {
      requests,
      http5xx,
      errorRate: requests > 0 ? (http5xx / requests) * 100 : 0,
    };
  };

  return {
    register,
    httpRequestsTotal,
    httpRequestDurationSeconds,
    appErrorsTotal,
    appLoadEventsTotal,
    appInfo,
    summary,
  };
}

export function registerMetrics(app: FastifyInstance, config: AppConfig): void {
  const metrics = createMetrics(config);

  app.decorate("metrics", metrics);

  app.addHook("onRequest", async (request: FastifyRequest) => {
    request.startTime = process.hrtime.bigint();
  });

  app.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const end = process.hrtime.bigint();
      const start = request.startTime ?? end;
      const durationSeconds = Number(end - start) / 1e9;

      const route = request.routeOptions.url ?? "unmatched";
      const labels = {
        method: request.method,
        route,
        status_code: String(reply.statusCode),
      };

      metrics.httpRequestsTotal.inc(labels);
      metrics.httpRequestDurationSeconds.observe(labels, durationSeconds);
    },
  );
}
