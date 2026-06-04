import { BarChart3, BookOpen, Gauge, Rocket, ScrollText } from "lucide-react";
import { ServiceAccessButton } from "@/components/dashboard/ServiceAccessButton";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

export function Docs() {
  const demoDocsUrl = `${config.repositoryUrl}/blob/main/docs/demo.md`;

  return (
    <div>
      <SectionHeader
        title="Docs"
        description={
          config.isStaticDemo
            ? "Static preview access notes and full local demo documentation."
            : "Local service links and API documentation."
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-100">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold text-slate-50">API Documentation</h2>
          </div>
          <div className="mt-5">
            <ServiceAccessButton
              label="Open API Docs"
              serviceName="OpenAPI Docs"
              description="Swagger UI served by the Fastify API in the local Docker Compose stack."
              url={config.apiDocsUrl}
              localUrl="http://localhost:8080/docs"
              icon={BookOpen}
              docsPath="docs/local-development.md"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-emerald-400/10 text-emerald-100">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold text-slate-50">
              Observability Links
            </h2>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ServiceAccessButton
              label="Prometheus"
              serviceName="Prometheus"
              description="Metrics target and Prometheus query UI for the local stack."
              url={config.prometheusUrl}
              localUrl="http://localhost:9090"
              icon={Gauge}
              docsPath="docs/monitoring.md"
            />
            <ServiceAccessButton
              label="Grafana"
              serviceName="Grafana"
              description="Provisioned dashboards for metrics and logs in the local observability stack."
              url={config.grafanaUrl}
              localUrl="http://localhost:3001"
              icon={BarChart3}
              docsPath="docs/monitoring.md"
            />
            <ServiceAccessButton
              label="Loki"
              serviceName="Loki"
              description="Log storage queried directly or through Grafana Explore in the local stack."
              url={config.lokiUrl}
              localUrl="http://localhost:3100"
              icon={ScrollText}
              docsPath="docs/logging.md"
            />
          </div>
        </div>
      </div>

      {config.isStaticDemo ? (
        <div className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-100">
              <Rocket className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-cyan-100">
                Static preview mode
              </h2>
              <p className="mt-1 text-sm text-cyan-100">
                Mock deployment history: v1.0.0 promoted to local, v0.9.0 kept
                as rollback target, observability checks passing.
              </p>
            </div>
          </div>
          <Button className="mt-5" variant="outline" asChild>
            <a href={demoDocsUrl} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" aria-hidden="true" />
              <span>Full Local Demo Guide</span>
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
