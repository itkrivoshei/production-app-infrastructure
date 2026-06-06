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

const requestTimeoutMs = 8_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(text: string, path: string, status: number): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new Error(
      `Invalid JSON response from ${path} with status ${status}`,
      { cause: error },
    );
  }
}

function errorMessage(body: string, status: number) {
  if (!body) {
    return `Request failed with status ${status}`;
  }

  try {
    const parsed = JSON.parse(body) as unknown;
    if (isRecord(parsed) && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // Keep non-JSON error responses readable.
  }

  return body;
}

async function fetchResponse(path: string, options?: RequestInit) {
  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
      signal: options?.signal ?? AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`Request timed out: ${path}`, { cause: error });
    }
    throw new Error(
      `Request failed: ${path}${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
      { cause: error },
    );
  }

  return response;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetchResponse(path, options);
  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(errorMessage(body, response.status));
  }

  return parseJson(body, path, response.status) as T;
}

async function requestText(path: string, options?: RequestInit) {
  const response = await fetchResponse(path, options);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(errorMessage(body.trim(), response.status));
  }

  return body;
}

function isControlledError(value: unknown): value is ApiErrorResponse {
  return (
    isRecord(value) &&
    value.status === "error" &&
    typeof value.message === "string" &&
    (value.timestamp === undefined || typeof value.timestamp === "string")
  );
}

const liveApi = {
  overview: () => request<OverviewResponse>("/overview"),
  health: () => request<HealthResponse>("/health"),
  ready: () => request<ReadyResponse>("/ready"),
  version: () => request<VersionResponse>("/version"),
  status: () => request<StatusResponse>("/status"),
  metricsText: () => requestText("/metrics"),
  generateCpuLoad: (durationMs = 1000) =>
    request<CpuLoadResponse>("/load/cpu", {
      method: "POST",
      headers: { "X-Demo-Action": "true" },
      body: JSON.stringify({ durationMs }),
    }),
  generateErrors: async () => {
    const path = "/load/errors";
    const response = await fetchResponse(path, {
      method: "POST",
      headers: { "X-Demo-Action": "true" },
    });
    const text = (await response.text()).trim();
    const body = parseJson(text, path, response.status);

    if (response.status !== 500 || !isControlledError(body)) {
      throw new Error(
        (isRecord(body) && typeof body.message === "string" && body.message) ||
          `Expected controlled HTTP 500 error response, received ${response.status}`,
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
