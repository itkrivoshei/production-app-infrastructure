import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Gauge } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RequestError } from "@/components/dashboard/RequestError";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { ServiceAccessButton } from "@/components/dashboard/ServiceAccessButton";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { parseMetricFamilies } from "@/lib/metrics";

export function Metrics() {
  const metrics = useQuery({
    queryKey: ["metrics-text"],
    queryFn: api.metricsText,
    refetchInterval: 10_000,
  });

  const metricLines =
    metrics.data?.split("\n").filter((line) => line && !line.startsWith("#"))
      .length ?? 0;

  const chartData = useMemo(
    () => parseMetricFamilies(metrics.data),
    [metrics.data],
  );

  return (
    <div>
      <SectionHeader
        title="Metrics"
        description="Prometheus-format backend metrics."
        action={
          <>
            <ServiceAccessButton
              label="/metrics"
              serviceName="API metrics endpoint"
              description="The Prometheus-format metrics endpoint is served by the local API."
              url={`${config.apiUrl}/metrics`}
              localUrl="http://localhost:8080/metrics"
              icon={BarChart3}
              docsPath="docs/monitoring.md"
            />
            <ServiceAccessButton
              label="Prometheus"
              serviceName="Prometheus"
              description="Metrics target and Prometheus query UI for the local stack."
              url={config.prometheusUrl}
              localUrl="http://localhost:9090"
              icon={Gauge}
              docsPath="docs/monitoring.md"
            />
          </>
        }
      />

      {metrics.isError ? (
        <RequestError
          title="Metrics unavailable"
          error={metrics.error}
          onRetry={() => void metrics.refetch()}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Metrics Endpoint"
          value={
            metrics.isError
              ? "Unavailable"
              : metrics.isSuccess
                ? "Available"
                : "Checking"
          }
        />
        <MetricCard title="Metric Lines" value={metricLines} />
        <MetricCard title="Refresh Interval" value="10s" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
        <pre className="max-h-[520px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {metrics.data ??
            (metrics.isError ? "Metrics request failed." : "Loading metrics...")}
        </pre>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="text-sm font-semibold text-slate-50">
            Metric family density
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid
                  stroke="#334155"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={{ stroke: "#334155" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
