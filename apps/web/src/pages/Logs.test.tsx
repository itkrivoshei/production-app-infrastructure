import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Logs } from "./Logs";

vi.mock("@/lib/api", () => ({
  api: {
    overview: vi.fn(),
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

function renderLogs() {
  return render(
    <QueryClientProvider client={queryClient}>
      <Logs />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

describe("Logs", () => {
  it("generates logs in demo mode", async () => {
    const user = userEvent.setup();
    vi.mocked(api.overview).mockResolvedValue(overviewResponse);
    vi.mocked(api.generateLog).mockResolvedValue({
      status: "ok",
      level: "info",
      message: "Manual log generated from dashboard",
      timestamp: "2026-06-05T00:00:00.000Z",
    });

    renderLogs();
    await user.click(
      await screen.findByRole("button", { name: "Generate Demo Log" }),
    );

    expect(
      await screen.findByText("[info] Manual log generated from dashboard"),
    ).toBeInTheDocument();
  });

  it("hides log generation in safe mode", async () => {
    vi.mocked(api.overview).mockResolvedValue({
      ...overviewResponse,
      mode: "safe",
    });

    renderLogs();

    expect(
      await screen.findByText(/Demo log generation is disabled in safe mode/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Generate Demo Log" }),
    ).not.toBeInTheDocument();
  });
});
