import type {
  ApiErrorResponse,
  CpuLoadResponse,
  GeneratedLogResponse,
  HealthResponse,
  OverviewResponse,
  ReadyResponse,
  StatusResponse,
  VersionResponse,
} from "@/types/api";
import { config } from "./config";
import { mockApi } from "./mockApi";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
      signal: options?.signal ?? AbortSignal.timeout(8_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(`Request timed out: ${path}`, { cause: error });
    }
    throw error;
  }

  if (!response.ok) {
    const body = (await response.text()).trim();
    let message = body;

    try {
      const parsed = JSON.parse(body) as { message?: string };
      message = parsed.message ?? body;
    } catch {
      // Keep non-JSON error responses readable.
    }

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const liveApi = {
  overview: () => request<OverviewResponse>("/overview"),
  health: () => request<HealthResponse>("/health"),
  ready: () => request<ReadyResponse>("/ready"),
  version: () => request<VersionResponse>("/version"),
  status: () => request<StatusResponse>("/status"),
  metricsText: async () => {
    const response = await fetch(`${config.apiUrl}/metrics`, {
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics with status ${response.status}`);
    }

    return response.text();
  },
  generateCpuLoad: (durationMs = 1000) =>
    request<CpuLoadResponse>("/load/cpu", {
      method: "POST",
      headers: { "X-Demo-Action": "true" },
      body: JSON.stringify({ durationMs }),
    }),
  generateErrors: async () => {
    const response = await fetch(`${config.apiUrl}/load/errors`, {
      method: "POST",
      headers: { "X-Demo-Action": "true" },
      signal: AbortSignal.timeout(8_000),
    });

    const body = (await response.json()) as ApiErrorResponse;

    if (response.status !== 500 || body.status !== "error") {
      throw new Error(
        body.message || `Expected controlled HTTP 500, received ${response.status}`,
      );
    }

    return {
      statusCode: response.status,
      body,
    };
  },
  generateLog: (level: "info" | "warn" | "error", message: string) =>
    request<GeneratedLogResponse>("/logs/generate", {
      method: "POST",
      headers: { "X-Demo-Action": "true" },
      body: JSON.stringify({ level, message }),
    }),
};

export type ApiClient = typeof liveApi;

export const api: ApiClient = config.isStaticDemo ? mockApi : liveApi;
