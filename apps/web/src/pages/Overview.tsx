import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, BookOpen, DatabaseZap, FileText, Gauge, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { config } from '@/lib/config';
import { summarizeMetrics } from '@/lib/metrics';
import { queryClient } from '@/lib/queryClient';

function formatUptime(seconds?: number) {
  if (!seconds) return '0s';

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

function refreshOverviewQueries() {
  const queryKeys = [['health'], ['ready'], ['version'], ['status'], ['metrics-text']] as const;

  queryKeys.forEach((queryKey) => {
    void queryClient.invalidateQueries({ queryKey });
  });
}

export function Overview() {
  const health = useQuery({ queryKey: ['health'], queryFn: api.health });
  const ready = useQuery({ queryKey: ['ready'], queryFn: api.ready });
  const version = useQuery({ queryKey: ['version'], queryFn: api.version });
  const status = useQuery({ queryKey: ['status'], queryFn: api.status });
  const metrics = useQuery({
    queryKey: ['metrics-text'],
    queryFn: api.metricsText,
    refetchInterval: 10_000
  });

  const cpuLoad = useMutation({
    mutationFn: () => api.generateCpuLoad(500),
    onSuccess: refreshOverviewQueries
  });
  const demoError = useMutation({
    mutationFn: () => api.generateErrors(),
    onSuccess: refreshOverviewQueries
  });
  const demoLog = useMutation({
    mutationFn: () => api.generateLog('info', 'Overview generated demo log'),
    onSuccess: refreshOverviewQueries
  });

  const isApiOk = health.data?.status === 'ok';
  const isReady = ready.data?.status === 'ready';
  const metricsSummary = useMemo(() => summarizeMetrics(metrics.data), [metrics.data]);
  const isRefreshing =
    health.isFetching ||
    ready.isFetching ||
    version.isFetching ||
    status.isFetching ||
    metrics.isFetching;

  return (
    <div>
      <SectionHeader
        title="Overview"
        description="Live API status, release metadata, and demo operations."
        action={
          <>
            <Button variant="outline" onClick={refreshOverviewQueries} disabled={isRefreshing}>
              <RefreshCw className="size-4" aria-hidden="true" />
              <span>{isRefreshing ? 'Checking' : 'Run Health Check'}</span>
            </Button>
            <Button asChild variant="outline">
              <a href={config.apiDocsUrl} target="_blank" rel="noreferrer">
                <BookOpen className="size-4" aria-hidden="true" />
                <span>API Docs</span>
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={config.grafanaUrl} target="_blank" rel="noreferrer">
                <Gauge className="size-4" aria-hidden="true" />
                <span>Grafana</span>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusCard
          title="API Status"
          value={health.isLoading ? 'Checking' : isApiOk ? 'Healthy' : 'Unhealthy'}
          status={isApiOk ? 'ok' : health.isError ? 'error' : 'unknown'}
          description="GET /health"
        />
        <StatusCard
          title="Readiness"
          value={ready.isLoading ? 'Checking' : isReady ? 'Ready' : 'Not Ready'}
          status={isReady ? 'ok' : ready.isError ? 'error' : 'unknown'}
          description="GET /ready"
        />
        <MetricCard
          title="Environment"
          value={version.data?.environment ?? status.data?.environment ?? 'unknown'}
          description={version.data?.service ?? 'devops-control-center-api'}
        />
        <MetricCard
          title="Version"
          value={version.data?.version ?? 'unknown'}
          description="GET /version"
        />
        <MetricCard
          title="Commit SHA"
          value={version.data?.commit ?? status.data?.commit ?? 'unknown'}
          description="Release metadata"
        />
        <MetricCard
          title="Uptime"
          value={formatUptime(status.data?.uptime ?? health.data?.uptime)}
          description="Backend process uptime"
        />
        <MetricCard
          title="Requests"
          value={formatNumber(metricsSummary.requests)}
          description="Sum of http_requests_total"
        />
        <MetricCard
          title="Errors"
          value={formatNumber(metricsSummary.errors)}
          description="Sum of app_errors_total"
        />
        <MetricCard
          title="Error Rate"
          value={`${metricsSummary.errorRate.toFixed(1)}%`}
          description="Errors divided by requests"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Button
          className="h-12 justify-start"
          onClick={() => cpuLoad.mutate()}
          disabled={cpuLoad.isPending}
        >
          <Activity className="size-4" aria-hidden="true" />
          <span>{cpuLoad.isPending ? 'Generating CPU Load' : 'Generate CPU Load'}</span>
        </Button>
        <Button
          className="h-12 justify-start"
          variant="secondary"
          onClick={() => demoError.mutate()}
          disabled={demoError.isPending}
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          <span>{demoError.isPending ? 'Generating Error' : 'Generate Errors'}</span>
        </Button>
        <Button
          className="h-12 justify-start"
          variant="outline"
          onClick={() => demoLog.mutate()}
          disabled={demoLog.isPending}
        >
          <FileText className="size-4" aria-hidden="true" />
          <span>{demoLog.isPending ? 'Generating Log' : 'Generate Logs'}</span>
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-cyan-100 text-cyan-800">
            <DatabaseZap className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">Backend endpoint source</h2>
            <p className="mt-1 text-sm text-slate-500">{config.apiUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
