import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Metrics } from "./Metrics";

vi.mock("recharts", () => ({
  Bar: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

vi.mock("@/lib/api", () => ({
  api: {
    metricsText: vi.fn(),
  },
}));

function renderMetrics() {
  return render(
    <QueryClientProvider client={queryClient}>
      <Metrics />
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

describe("Metrics", () => {
  it("renders metrics returned by the API", async () => {
    vi.mocked(api.metricsText).mockResolvedValue(
      'http_requests_total{route="/health"} 2',
    );

    renderMetrics();

    expect(await screen.findByText("Available")).toBeInTheDocument();
    expect(
      screen.getByText('http_requests_total{route="/health"} 2'),
    ).toBeInTheDocument();
  });

  it("shows a retryable metrics error", async () => {
    const user = userEvent.setup();
    vi.mocked(api.metricsText).mockRejectedValue(new Error("Metrics unavailable"));

    renderMetrics();

    expect(await screen.findAllByText("Metrics unavailable")).toHaveLength(2);
    vi.mocked(api.metricsText).mockResolvedValue("http_requests_total 1");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("Available")).toBeInTheDocument();
  });
});
