import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityConsole } from "./ActivityConsole";

describe("ActivityConsole", () => {
  it("renders an empty state before demo actions run", () => {
    render(<ActivityConsole entries={[]} />);

    expect(screen.getByText("Activity Console")).toBeInTheDocument();
    expect(
      screen.getByText("Run a demo action to see timestamped results here."),
    ).toBeInTheDocument();
  });

  it("renders timestamped demo action results", () => {
    render(
      <ActivityConsole
        entries={[
          {
            id: "event-1",
            title: "CPU load generated",
            description: "Static preview simulated CPU load and refreshed metrics.",
            timestamp: "2026-06-04T12:00:00.000Z",
            status: "success",
          },
        ]}
      />,
    );

    expect(screen.getByText("CPU load generated")).toBeInTheDocument();
    expect(
      screen.getByText("Static preview simulated CPU load and refreshed metrics."),
    ).toBeInTheDocument();
    expect(screen.getByText("success")).toBeInTheDocument();
  });
});
