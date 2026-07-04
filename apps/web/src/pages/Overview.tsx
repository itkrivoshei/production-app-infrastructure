import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  DatabaseZap,
  FileText,
  Gauge,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { ActivityConsole } from "@/components/dashboard/ActivityConsole";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RequestError } from "@/components/dashboard/RequestError";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ServiceAccessButton } from "@/components/dashboard/ServiceAccessButton";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { Button } from "@/components/ui/button";
import { useActivityLog } from "@/lib/activity";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { queryClient } from "@/lib/queryClient";

function formatUptime(seconds?: number) {
  if (!seconds) return "0s";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 1) return `${remainingSeconds}s`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 1) return `${minutes}m ${remainingSeconds}s`;

  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(Math.round(value));
}

async function refreshOverviewQuery() {
  await queryClient.invalidateQueries({
    queryKey: ["overview"],
    refetchType: "none",
  });
  return queryClient.fetchQuery({
    queryKey: ["overview"],
    queryFn: api.overview,
    staleTime: 0,
  });
}

export function Overview() {
  const [isHealthCheckPending, setIsHealthCheckPending] = useState(false);
  const { activityEntries, addActivity } = useActivityLog([
    {
      id: "initial-demo-state",
      title: config.isStaticDemo ? "Static preview ready" : "Local dashboard ready",
      description: config.isStaticDemo
        ? "Mock health, readiness, version, request, error, and log data are loaded. Demo actions below update the simulated state."
        : "The dashboard is connected to the local API and observability stack.",
      timestamp: new Date().toISOString(),
      status: "info",
    },
  ], "devops-control-center:overview-activity");
  const overview = useQuery({
    queryKey: ["overview"],
    queryFn: api.overview,
    refetchInterval: 10_000,
  });

  const cpuLoad = useMutation({
    mutationFn: () => api.generateCpuLoad(500),
    onSuccess: async (data) => {
      addActivity({
        title: "CPU load generated",
        description: config.isStaticDemo
          ? `Static preview simulated ${data.operations.toLocaleString()} CPU operations over ${data.durationMs}ms and refreshed request/load metrics.`
          : `Backend generated ${data.operations.toLocaleString()} CPU operations over ${data.durationMs}ms and exposed the change through metrics/logs.`,
        status: "success",
      });
      await refreshOverviewQuery();
    },
    onError: (error) => {
      addActivity({
        title: "CPU load failed",
        description:
          error instanceof Error
            ? error.message
            : "The dashboard could not complete the CPU load request.",
        status: "error",
      });
    },
  });
  const demoError = useMutation({
    mutationFn: () => api.generateErrors(),
    onSuccess: async (data) => {
      addActivity({
        title: "Controlled demo error generated",
        description: config.isStaticDemo
          ? `Static preview added one controlled demo error and updated the error count/rate. Mock status: HTTP ${data.statusCode}.`
          : `Backend returned the expected controlled demo error. Status: HTTP ${data.statusCode}.`,
        status: "warning",
      });
      await refreshOverviewQuery();
    },
    onError: (error) => {
      addActivity({
        title: "Demo error action failed",
        description:
          error instanceof Error
            ? error.message
            : "The dashboard could not complete the controlled error request.",
        status: "error",
      });
    },
  });
  const demoLog = useMutation({
    mutationFn: () => api.generateLog("info", "Overview generated demo log"),
    onSuccess: async (data) => {
      addActivity({
        title: "Demo log generated",
        description: config.isStaticDemo
          ? `Static preview added a mock ${data.level} log entry: "${data.message}".`
          : `Backend emitted a structured ${data.level} log for Alloy/Loki: "${data.message}".`,
        status: "success",
      });
      await refreshOverviewQuery();
    },
    onError: (error) => {
      addActivity({
        title: "Demo log failed",
        description:
          error instanceof Error
            ? error.message
            : "The dashboard could not complete the log generation request.",
        status: "error",
      });
    },
  });

  const runHealthCheck = async () => {
    setIsHealthCheckPending(true);

    try {
      await refreshOverviewQuery();
      addActivity({
        title: "Health check completed",
        description: config.isStaticDemo
          ? "Static preview refreshed mock health, readiness, version, uptime, and Prometheus-style metric data."
          : "Local API health, readiness, release metadata, uptime, and HTTP metrics were refreshed from the running stack.",
        status: "success",
      });
    } catch (error) {
      addActivity({
        title: "Health check failed",
        description:
          error instanceof Error
            ? error.message
            : "One or more dashboard health queries failed.",
        status: "error",
      });
    } finally {
      setIsHealthCheckPending(false);
    }
  };

  const isApiOk = overview.data?.health === "ok";
  const isReady = overview.data?.readiness === "ready";
  const demoActionsAvailable =
    config.isStaticDemo || overview.data?.mode === "demo";
  const isRefreshing = overview.isFetching || isHealthCheckPending;

  return (
    <div>
      <SectionHeader
        title="Overview"
        description="Live API status, release metadata, and demo operations."
        action={
          <>
            <Button
              variant="outline"
              onClick={() => void runHealthCheck()}
              disabled={isRefreshing}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span>{isRefreshing ? "Checking" : "Run Health Check"}</span>
            </Button>
            <ServiceAccessButton
              label="API Docs"
              serviceName="OpenAPI Docs"
              description="Swagger UI served by the Fastify API in the local Docker Compose stack."
              url={config.apiDocsUrl}
              localUrl={config.localUrls.apiDocs}
              icon={BookOpen}
              docsPath="docs/local-development.md"
            />
            <ServiceAccessButton
              label="Grafana"
              serviceName="Grafana"
              description="Provisioned dashboards for metrics and logs in the local observability stack."
              url={config.grafanaUrl}
              localUrl={config.localUrls.grafana}
              icon={BarChart3}
              docsPath="docs/monitoring.md"
              localOnly
            />
            <ServiceAccessButton
              label="Prometheus"
              serviceName="Prometheus"
              description="Metrics target and Prometheus query UI for the local stack."
              url={config.prometheusUrl}
              localUrl={config.localUrls.prometheus}
              icon={Gauge}
              docsPath="docs/monitoring.md"
              localOnly
            />
            <ServiceAccessButton
              label="Loki"
              serviceName="Loki"
              description="Loki log storage is queried through Grafana Explore in the local stack."
              url={config.lokiExploreUrl}
              localUrl={config.localUrls.lokiExplore}
              icon={ScrollText}
              docsPath="docs/logging.md"
              localOnly
            />
          </>
        }
      />

      {config.isStaticDemo ? (
        <div className="mb-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          Static preview actions update mock metrics and the Activity Console.
          The full observability services run locally with Docker Compose.
        </div>
      ) : null}

      {overview.isError ? (
        <RequestError
          title="Overview data unavailable"
          error={overview.error}
          onRetry={() => void overview.refetch()}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusCard
          title="API Status"
          value={
            overview.isLoading ? "Checking" : isApiOk ? "Healthy" : "Unhealthy"
          }
          status={isApiOk ? "ok" : overview.isError ? "error" : "unknown"}
          description="GET /overview"
        />
        <StatusCard
          title="Readiness"
          value={
            overview.isLoading ? "Checking" : isReady ? "Ready" : "Not Ready"
          }
          status={isReady ? "ok" : overview.isError ? "error" : "unknown"}
          description="Aggregated readiness"
        />
        <MetricCard
          title="Environment"
          value={overview.data?.environment ?? "unknown"}
          description={overview.data?.service ?? "devops-control-center-api"}
        />
        <MetricCard
          title="Version"
          value={overview.data?.version ?? "unknown"}
          description="Release metadata"
        />
        <MetricCard
          title="Commit SHA"
          value={overview.data?.commit ?? "unknown"}
          description="Release metadata"
        />
        <MetricCard
          title="Uptime"
          value={formatUptime(overview.data?.uptime)}
          description="Backend process uptime"
        />
        <MetricCard
          title="Requests"
          value={formatNumber(overview.data?.requests ?? 0)}
          description="HTTP requests"
        />
        <MetricCard
          title="HTTP 5xx"
          value={formatNumber(overview.data?.http5xx ?? 0)}
          description="Server error responses"
        />
        <MetricCard
          title="Error Rate"
          value={`${(overview.data?.errorRate ?? 0).toFixed(1)}%`}
          description="HTTP 5xx divided by requests"
        />
      </div>

      {demoActionsAvailable ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Button
          className="h-12 justify-start"
          onClick={() => cpuLoad.mutate()}
          disabled={cpuLoad.isPending}
        >
          <Activity className="size-4" aria-hidden="true" />
          <span>
            {cpuLoad.isPending ? "Generating CPU Load" : "Generate CPU Load"}
          </span>
        </Button>
        <Button
          className="h-12 justify-start"
          variant="secondary"
          onClick={() => demoError.mutate()}
          disabled={demoError.isPending}
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          <span>
            {demoError.isPending ? "Generating Error" : "Generate Errors"}
          </span>
        </Button>
        <Button
          className="h-12 justify-start"
          variant="outline"
          onClick={() => demoLog.mutate()}
          disabled={demoLog.isPending}
        >
          <FileText className="size-4" aria-hidden="true" />
          <span>{demoLog.isPending ? "Generating Log" : "Generate Logs"}</span>
        </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
          Demo actions are disabled in safe mode. Start the local demo profile to
          generate controlled load, errors, and logs.
        </div>
      )}

      <ActivityConsole entries={activityEntries} className="mt-6" />

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-100">
            <DatabaseZap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-50">
              Backend endpoint source
            </h2>
            <p className="mt-1 text-sm text-slate-400">{config.apiUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
