import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { SystemInfo } from "./SystemInfo";

vi.mock("@/lib/api", () => ({
  api: {
    status: vi.fn(),
  },
}));

function renderSystemInfo() {
  return render(
    <QueryClientProvider client={queryClient}>
      <SystemInfo />
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

describe("SystemInfo", () => {
  it("renders runtime metadata", async () => {
    vi.mocked(api.status).mockResolvedValue({
      service: "devops-control-center-api",
      version: "1.2.3",
      commit: "abc1234",
      environment: "test",
      status: "ok",
      uptime: 42,
      timestamp: "2026-06-05T00:00:00.000Z",
    });

    renderSystemInfo();

    expect(await screen.findByText(/devops-control-center-api/)).toBeInTheDocument();
    expect(screen.getByText(/abc1234/)).toBeInTheDocument();
  });

  it("shows and retries runtime metadata errors", async () => {
    const user = userEvent.setup();
    vi.mocked(api.status).mockRejectedValue(new Error("Status unavailable"));

    renderSystemInfo();

    expect(await screen.findByText("Status unavailable")).toBeInTheDocument();
    vi.mocked(api.status).mockResolvedValue({
      service: "devops-control-center-api",
      version: "1.2.3",
      commit: "abc1234",
      environment: "test",
      status: "ok",
      uptime: 42,
      timestamp: "2026-06-05T00:00:00.000Z",
    });
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(/abc1234/)).toBeInTheDocument();
  });
});
