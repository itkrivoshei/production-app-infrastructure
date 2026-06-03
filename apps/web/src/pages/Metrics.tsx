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
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { Button } from "@/components/ui/button";
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
            <Button asChild variant="outline">
              <a
                href={`${config.apiUrl}/metrics`}
                target="_blank"
                rel="noreferrer"
              >
                <BarChart3 className="size-4" aria-hidden="true" />
                <span>/metrics</span>
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={config.prometheusUrl} target="_blank" rel="noreferrer">
                <Gauge className="size-4" aria-hidden="true" />
                <span>Prometheus</span>
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Metrics Endpoint"
          value={metrics.isSuccess ? "Available" : "Checking"}
        />
        <MetricCard title="Metric Lines" value={metricLines} />
        <MetricCard title="Refresh Interval" value="10s" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,480px)]">
        <pre className="max-h-[520px] overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {metrics.data ?? "Loading metrics..."}
        </pre>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Metric family density
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
