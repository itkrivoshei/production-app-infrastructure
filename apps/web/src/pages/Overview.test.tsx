import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Overview } from "./Overview";

vi.mock("@/lib/api", () => ({
  api: {
    overview: vi.fn(),
    generateCpuLoad: vi.fn(),
    generateErrors: vi.fn(),
    generateLog: vi.fn(),
  },
}));

const overviewResponse = {
  health: "ok" as const,
  readiness: "ready" as const,
  service: "devops-control-center-api",
  version: "1.2.3",
  commit: "abc1234",
  environment: "test",
  mode: "demo" as const,
  uptime: 125,
  requests: 100,
  http5xx: 2,
  errorRate: 2,
  timestamp: "2026-06-05T00:00:00.000Z",
};

function renderOverview() {
  return render(
    <QueryClientProvider client={queryClient}>
      <Overview />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

beforeEach(() => {
  queryClient.setDefaultOptions({
    queries: {
      retry: false,
      staleTime: 0,
    },
  });
});

describe("Overview", () => {
  it("runs a real overview refresh before reporting health-check success", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview).mockResolvedValue(overviewResponse);

    renderOverview();
    await screen.findByText("Healthy");
    await user.click(screen.getByRole("button", { name: "Run Health Check" }));

    await screen.findByText("Health check completed");
    expect(api.overview).toHaveBeenCalledTimes(2);
  });

  it("reports a failed health check instead of a false success", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview)
      .mockResolvedValueOnce(overviewResponse)
      .mockRejectedValue(new Error("API unavailable"));

    renderOverview();
    await screen.findByText("Healthy");
    await user.click(screen.getByRole("button", { name: "Run Health Check" }));

    await screen.findByText("Health check failed");
    expect(screen.getAllByText("API unavailable")).not.toHaveLength(0);
  });

  it("runs demo actions only when the API reports demo mode", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview).mockResolvedValue(overviewResponse);
    vi.mocked(api.generateErrors).mockResolvedValue({
      statusCode: 500,
      body: {
        status: "error",
        message: "Demo error generated intentionally",
        timestamp: "2026-06-05T00:00:00.000Z",
      },
    });

    renderOverview();
    await user.click(await screen.findByRole("button", { name: "Generate Errors" }));

    await screen.findByText("Controlled demo error generated");
    expect(api.generateErrors).toHaveBeenCalledOnce();
  });

  it("shows a retryable error when overview data is unavailable", async () => {
    vi.mocked(api.overview).mockRejectedValue(new Error("Network unavailable"));

    renderOverview();

    await waitFor(() => {
      expect(screen.getByText("Overview data unavailable")).toBeInTheDocument();
    });
    expect(screen.getByText("Network unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
