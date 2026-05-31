import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.TARGET_BASE_URL || 'http://localhost:8088';

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 500));

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '15s', target: 0 }
  ],
  thresholds: {
    checks: ['rate>0.90'],
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000']
  },
  summaryTrendStats: ['min', 'avg', 'med', 'p(90)', 'p(95)', 'max']
};

const jsonHeaders = {
  headers: {
    'Content-Type': 'application/json'
  }
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

export default function () {
  group('read endpoints', () => {
    const endpoints = ['/api/health', '/api/ready', '/api/version', '/api/status', '/api/metrics'];
    const endpoint = endpoints[randomInt(endpoints.length)];
    const response = http.get(`${BASE_URL}${endpoint}`);

    check(response, {
      [`GET ${endpoint} returned 2xx`]: (res) => res.status >= 200 && res.status < 300
    });
  });

  group('demo actions', () => {
    const actionRoll = randomInt(100);

    if (actionRoll < 60) {
      const logPayload = JSON.stringify({
        level: 'info',
        message: `k6 load test info log ${Date.now()}`
      });

      const logResponse = http.post(`${BASE_URL}/api/logs/generate`, logPayload, jsonHeaders);

      check(logResponse, {
        'generated info log': (res) => res.status === 200
      });
    }

    if (actionRoll >= 60 && actionRoll < 85) {
      const loadPayload = JSON.stringify({
        durationMs: 100
      });

      const loadResponse = http.post(`${BASE_URL}/api/load/cpu`, loadPayload, jsonHeaders);

      check(loadResponse, {
        'generated cpu load': (res) => res.status === 200
      });
    }

    if (actionRoll >= 85) {
      const errorResponse = http.post(`${BASE_URL}/api/load/errors`);

      check(errorResponse, {
        'generated intentional error': (res) => res.status === 500
      });
    }
  });

  sleep(1);
}
