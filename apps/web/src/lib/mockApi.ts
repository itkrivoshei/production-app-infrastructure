import type { ApiClient } from './api';

const startedAt = Date.now() - 12 * 60 * 1000 - 40 * 1000;

const mockState = {
  requests: 1240,
  errors: 12,
  cpuLoadEvents: 4,
  logs: [
    {
      level: 'info',
      message: 'Static preview loaded with mock observability data',
      timestamp: new Date(Date.now() - 30_000).toISOString()
    },
    {
      level: 'warn',
      message: 'Synthetic latency spike detected during demo load',
      timestamp: new Date(Date.now() - 90_000).toISOString()
    }
  ]
};

function timestamp() {
  return new Date().toISOString();
}

function uptimeSeconds() {
  return Math.round((Date.now() - startedAt) / 1000);
}

function recordRequest(statusCode = 200) {
  mockState.requests += 1;

  if (statusCode >= 500) {
    mockState.errors += 1;
  }
}

function createMetricsText() {
  const errors = mockState.errors;
  const successfulRequests = Math.max(mockState.requests - errors, 0);
  const healthRequests = Math.floor(successfulRequests * 0.22);
  const readyRequests = Math.floor(successfulRequests * 0.18);
  const metricsRequests = Math.floor(successfulRequests * 0.2);
  const loadRequests = Math.floor(successfulRequests * 0.16);
  const statusRequests = Math.max(
    successfulRequests - healthRequests - readyRequests - metricsRequests - loadRequests,
    0
  );

  return [
    '# HELP http_requests_total Total number of HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total{method="GET",route="/health",status_code="200"} ${healthRequests}`,
    `http_requests_total{method="GET",route="/ready",status_code="200"} ${readyRequests}`,
    `http_requests_total{method="GET",route="/metrics",status_code="200"} ${metricsRequests}`,
    `http_requests_total{method="GET",route="/status",status_code="200"} ${statusRequests}`,
    `http_requests_total{method="POST",route="/load/cpu",status_code="200"} ${loadRequests}`,
    `http_requests_total{method="POST",route="/load/errors",status_code="500"} ${errors}`,
    '# HELP app_errors_total Total number of demo application errors',
    '# TYPE app_errors_total counter',
    `app_errors_total{route="/load/errors",type="demo"} ${errors}`,
    '# HELP app_load_events_total Total number of generated demo load events',
    '# TYPE app_load_events_total counter',
    `app_load_events_total{type="cpu"} ${mockState.cpuLoadEvents}`,
    '# HELP app_info Application metadata',
    '# TYPE app_info gauge',
    'app_info{service="devops-control-center-api",version="1.0.0",commit="abc1234",environment="local"} 1',
    '# HELP node_process_uptime_seconds Mock Node.js process uptime',
    '# TYPE node_process_uptime_seconds gauge',
    `node_process_uptime_seconds ${uptimeSeconds()}`
  ].join('\n');
}

export const mockApi = {
  health: async () => {
    recordRequest();
    return {
      status: 'ok',
      uptime: uptimeSeconds(),
      timestamp: timestamp()
    };
  },
  ready: async () => {
    recordRequest();
    return {
      status: 'ready',
      checks: {
        api: 'ok'
      },
      timestamp: timestamp()
    };
  },
  version: async () => {
    recordRequest();
    return {
      service: 'devops-control-center-api',
      version: '1.0.0',
      commit: 'abc1234',
      environment: 'local'
    };
  },
  status: async () => {
    recordRequest();
    return {
      service: 'devops-control-center-api',
      version: '1.0.0',
      commit: 'abc1234',
      environment: 'local',
      status: 'ok',
      uptime: uptimeSeconds(),
      timestamp: timestamp(),
      serviceStatus: [
        { name: 'api', status: 'healthy' },
        { name: 'prometheus', status: 'up' },
        { name: 'grafana', status: 'ready' },
        { name: 'loki', status: 'ready' }
      ],
      deploymentHistory: [
        { version: '1.0.0', status: 'current', environment: 'local' },
        { version: '0.9.0', status: 'rollback-target', environment: 'local' }
      ]
    };
  },
  metricsText: async () => {
    recordRequest();
    return createMetricsText();
  },
  generateCpuLoad: async (durationMs = 1000) => {
    recordRequest();
    mockState.cpuLoadEvents += 1;

    return {
      status: 'ok',
      type: 'cpu',
      durationMs,
      operations: Math.round(durationMs * 950 + Math.random() * 25_000),
      timestamp: timestamp()
    };
  },
  generateErrors: async () => {
    recordRequest(500);

    return {
      statusCode: 500,
      body: {
        status: 'error',
        message: 'Demo error generated intentionally',
        timestamp: timestamp()
      }
    };
  },
  generateLog: async (level: 'info' | 'warn' | 'error', message: string) => {
    recordRequest();

    const entry = {
      status: 'ok',
      level,
      message,
      timestamp: timestamp()
    };

    mockState.logs = [entry, ...mockState.logs].slice(0, 20);

    return entry;
  }
} satisfies ApiClient;
