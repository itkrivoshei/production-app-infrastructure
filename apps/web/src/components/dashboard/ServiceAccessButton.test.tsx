import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gauge } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { ServiceAccessButton } from "./ServiceAccessButton";

vi.mock("@/lib/config", () => ({
  config: {
    isStaticDemo: true,
    repositoryUrl: "https://github.com/itkrivoshei/production-app-infrastructure",
  },
}));

describe("ServiceAccessButton", () => {
  it("shows local demo guidance instead of opening local-only static links", async () => {
    const user = userEvent.setup();

    render(
      <ServiceAccessButton
        label="Grafana"
        serviceName="Grafana"
        description="Provisioned dashboards run in the full local demo."
        url="/grafana"
        localUrl="http://localhost:3001"
        icon={Gauge}
        docsPath="docs/monitoring.md"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Grafana" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This online demo is a static UI preview. The full observability stack runs locally with Docker Compose.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("http://localhost:3001")).toBeInTheDocument();
    expect(screen.getByText("docker compose up --build -d")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open local demo guide/i }),
    ).toHaveAttribute(
      "href",
      "https://github.com/itkrivoshei/production-app-infrastructure/blob/main/docs/monitoring.md",
    );
  });
});
