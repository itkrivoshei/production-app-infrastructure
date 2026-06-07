import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gauge } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceAccessButton } from "./ServiceAccessButton";

const configMock = vi.hoisted(() => ({
  isStaticDemo: true,
  localServicesAvailable: false,
  repositoryUrl: "https://github.com/itkrivoshei/production-app-infrastructure",
}));

vi.mock("@/lib/config", () => ({
  config: configMock,
}));

describe("ServiceAccessButton", () => {
  beforeEach(() => {
    configMock.isStaticDemo = true;
    configMock.localServicesAvailable = false;
  });

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
        localOnly
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
    expect(
      screen.getByText(
        "COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml docker compose --profile observability up --build -d",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open local demo guide/i }),
    ).toHaveAttribute(
      "href",
      "https://github.com/itkrivoshei/production-app-infrastructure/blob/main/docs/monitoring.md",
    );
  });

  it("shows local guidance for local-only links in a safe deployment", async () => {
    configMock.isStaticDemo = false;
    configMock.localServicesAvailable = false;
    const user = userEvent.setup();

    render(
      <ServiceAccessButton
        label="Grafana"
        serviceName="Grafana"
        description="Provisioned dashboards run in the full local demo."
        url="http://localhost:3001"
        localUrl="http://localhost:3001"
        icon={Gauge}
        localOnly
      />,
    );

    await user.click(screen.getByRole("button", { name: "Grafana" }));

    expect(
      screen.getByText(
        "This deployment does not expose the local observability stack. Run the full demo locally with Docker Compose.",
      ),
    ).toBeInTheDocument();
  });

  it("opens local-only links directly when local services are available", () => {
    configMock.isStaticDemo = false;
    configMock.localServicesAvailable = true;

    render(
      <ServiceAccessButton
        label="Grafana"
        serviceName="Grafana"
        description="Provisioned dashboards run in the full local demo."
        url="http://localhost:3001"
        localUrl="http://localhost:3001"
        icon={Gauge}
        localOnly
      />,
    );

    expect(screen.getByRole("link", { name: "Grafana" })).toHaveAttribute(
      "href",
      "http://localhost:3001",
    );
  });

  it("opens deployment services directly even without local observability", () => {
    configMock.isStaticDemo = false;
    configMock.localServicesAvailable = false;

    render(
      <ServiceAccessButton
        label="API Docs"
        serviceName="API Docs"
        description="API documentation."
        url="/api/docs"
        localUrl="http://localhost:3000/api/docs"
        icon={Gauge}
      />,
    );

    expect(screen.getByRole("link", { name: "API Docs" })).toHaveAttribute(
      "href",
      "/api/docs",
    );
  });
});
