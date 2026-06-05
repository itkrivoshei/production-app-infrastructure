import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";
import { RequestError } from "./dashboard/RequestError";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resilience components", () => {
  it("renders readable request failures and retries", () => {
    const retry = vi.fn();
    render(
      <RequestError
        title="Metrics unavailable"
        error={new Error("Request timed out")}
        onRetry={retry}
      />,
    );

    expect(screen.getByText("Request timed out")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("contains render failures in the dashboard error boundary", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    function BrokenComponent(): never {
      throw new Error("Render failed");
    }

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "Dashboard unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Render failed")).toBeInTheDocument();
  });
});
