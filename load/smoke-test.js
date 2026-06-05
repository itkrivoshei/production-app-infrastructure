import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.TARGET_BASE_URL || "http://localhost:8088";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ["rate>0.95"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
  summaryTrendStats: ["min", "avg", "med", "p(90)", "p(95)", "max"],
};

const jsonHeaders = {
  headers: {
    "Content-Type": "application/json",
    "X-Demo-Action": "true",
  },
};

export default function () {
  group("basic API health", () => {
    const health = http.get(`${BASE_URL}/api/health`);

    check(health, {
      "health status is 200": (response) => response.status === 200,
      "health response contains ok": (response) =>
        response.body.includes('"status":"ok"'),
    });

    const ready = http.get(`${BASE_URL}/api/ready`);

    check(ready, {
      "ready status is 200": (response) => response.status === 200,
    });

    const version = http.get(`${BASE_URL}/api/version`);

    check(version, {
      "version status is 200": (response) => response.status === 200,
      "version contains service": (response) =>
        response.body.includes("service"),
    });
  });

  group("metrics endpoint", () => {
    const metrics = http.get(`${BASE_URL}/api/metrics`);

    check(metrics, {
      "metrics status is 200": (response) => response.status === 200,
      "metrics contain http_requests_total": (response) =>
        response.body.includes("http_requests_total"),
    });
  });

  group("generate smoke log", () => {
    const payload = JSON.stringify({
      level: "info",
      message: `k6 smoke test log ${Date.now()}`,
    });

    const logResponse = http.post(
      `${BASE_URL}/api/logs/generate`,
      payload,
      jsonHeaders,
    );

    check(logResponse, {
      "log generation status is 200": (response) => response.status === 200,
    });
  });

  sleep(1);
}
