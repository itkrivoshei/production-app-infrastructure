import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { LoadTest } from "./LoadTest";

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

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

describe("LoadTest", () => {
  it("runs demo actions and displays their outcomes", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview).mockResolvedValue(overviewResponse);
    vi.mocked(api.generateCpuLoad).mockResolvedValue({
      status: "ok",
      type: "cpu",
      durationMs: 1000,
      operations: 42,
      timestamp: "2026-06-05T00:00:00.000Z",
    });
    vi.mocked(api.generateLog).mockResolvedValue({
      status: "ok",
      level: "info",
      message: "Frontend generated demo log",
      timestamp: "2026-06-05T00:00:00.000Z",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoadTest />
      </QueryClientProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /Generate CPU Load/i }),
    );
    await screen.findAllByText("CPU load action completed");

    await user.click(screen.getByRole("button", { name: /Generate Logs/i }));
    await screen.findAllByText("Log action completed");

    expect(api.generateCpuLoad).toHaveBeenCalledWith(1000);
    expect(api.generateLog).toHaveBeenCalledWith(
      "info",
      "Frontend generated demo log",
    );
  });

  it("shows demo action failures to the user", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview).mockResolvedValue(overviewResponse);
    vi.mocked(api.generateErrors).mockRejectedValue(new Error("Demo disabled"));

    render(
      <QueryClientProvider client={queryClient}>
        <LoadTest />
      </QueryClientProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /Generate Errors/i }),
    );

    await screen.findAllByText("Controlled error action failed");
    expect(screen.getAllByText("Demo disabled")).not.toHaveLength(0);
  });

  it("does not expose demo actions in safe mode", async () => {
    vi.mocked(api.overview).mockResolvedValue({
      ...overviewResponse,
      mode: "safe",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <LoadTest />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText(/Demo actions are disabled in safe mode/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Generate CPU Load/i }),
    ).not.toBeInTheDocument();
  });
});
