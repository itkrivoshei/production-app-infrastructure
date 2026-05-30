export type HealthResponse = {
  status: string;
  uptime: number;
  timestamp: string;
};

export type ReadyResponse = {
  status: string;
  checks: {
    api: string;
  };
  timestamp: string;
};

export type VersionResponse = {
  service: string;
  version: string;
  commit: string;
  environment: string;
};

export type StatusResponse = {
  service: string;
  version: string;
  commit: string;
  environment: string;
  status: string;
  uptime: number;
  timestamp: string;
};

export type CpuLoadResponse = {
  status: string;
  type: string;
  durationMs: number;
  operations: number;
  timestamp: string;
};

export type GeneratedLogResponse = {
  status: string;
  level: string;
  message: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  status: string;
  message: string;
  timestamp?: string;
};
