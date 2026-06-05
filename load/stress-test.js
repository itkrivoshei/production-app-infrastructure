import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.TARGET_BASE_URL || "http://localhost:8088";

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 409, 500));

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "1m", target: 40 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    checks: ["rate>0.85"],
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<2000"],
  },
  summaryTrendStats: ["min", "avg", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const jsonHeaders = {
  headers: {
    "Content-Type": "application/json",
    "X-Demo-Action": "true",
  },
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function () {
  group("mixed stress traffic", () => {
    const roll = randomInt(100);

    if (roll < 50) {
      const response = http.get(`${BASE_URL}/api/status`);

      check(response, {
        "status endpoint is available": (res) => res.status === 200,
      });
    }

    if (roll >= 50 && roll < 75) {
      const response = http.get(`${BASE_URL}/api/metrics`);

      check(response, {
        "metrics endpoint is available": (res) => res.status === 200,
      });
    }

    if (roll >= 75 && roll < 90) {
      const payload = JSON.stringify({
        durationMs: 150,
      });

      const response = http.post(
        `${BASE_URL}/api/load/cpu`,
        payload,
        jsonHeaders,
      );

      check(response, {
        "cpu load generated or bounded": (res) =>
          res.status === 200 || res.status === 409,
      });
    }

    if (roll >= 90) {
      const response = http.post(
        `${BASE_URL}/api/load/errors`,
        JSON.stringify({}),
        jsonHeaders,
      );

      check(response, {
        "intentional error generated": (res) => res.status === 500,
      });
    }
  });

  sleep(0.5);
}
