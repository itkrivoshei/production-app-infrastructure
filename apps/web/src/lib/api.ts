import type {
  ApiErrorResponse,
  CpuLoadResponse,
  GeneratedLogResponse,
  HealthResponse,
  ReadyResponse,
  StatusResponse,
  VersionResponse,
} from "@/types/api";
import { config } from "./config";
import { mockApi } from "./mockApi";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const liveApi = {
  health: () => request<HealthResponse>("/health"),
  ready: () => request<ReadyResponse>("/ready"),
  version: () => request<VersionResponse>("/version"),
  status: () => request<StatusResponse>("/status"),
  metricsText: async () => {
    const response = await fetch(`${config.apiUrl}/metrics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics with status ${response.status}`);
    }

    return response.text();
  },
  generateCpuLoad: (durationMs = 1000) =>
    request<CpuLoadResponse>("/load/cpu", {
      method: "POST",
      body: JSON.stringify({ durationMs }),
    }),
  generateErrors: async () => {
    const response = await fetch(`${config.apiUrl}/load/errors`, {
      method: "POST",
    });

    const body = (await response.json()) as ApiErrorResponse;

    return {
      statusCode: response.status,
      body,
    };
  },
  generateLog: (level: "info" | "warn" | "error", message: string) =>
    request<GeneratedLogResponse>("/logs/generate", {
      method: "POST",
      body: JSON.stringify({ level, message }),
    }),
};

export type ApiClient = typeof liveApi;

export const api: ApiClient = config.isStaticDemo ? mockApi : liveApi;
