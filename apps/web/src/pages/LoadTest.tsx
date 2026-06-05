import { useMutation } from "@tanstack/react-query";
import { Activity, AlertTriangle, FileText } from "lucide-react";
import { ActionButton } from "@/components/dashboard/ActionButton";
import { ActivityConsole } from "@/components/dashboard/ActivityConsole";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { useActivityLog } from "@/lib/activity";
import { api } from "@/lib/api";
import { config } from "@/lib/config";
import { queryClient } from "@/lib/queryClient";

export function LoadTest() {
  const { activityEntries, addActivity } = useActivityLog();

  const cpuLoad = useMutation({
    mutationFn: () => api.generateCpuLoad(1000),
    onSuccess: async (data) => {
      addActivity({
        title: "CPU load action completed",
        description: config.isStaticDemo
          ? `Static preview simulated ${data.operations.toLocaleString()} CPU operations and updated mock load metrics.`
          : `Local API generated ${data.operations.toLocaleString()} CPU operations for ${data.durationMs}ms.`,
        status: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["metrics-text"] });
    },
    onError: (error) => {
      addActivity({
        title: "CPU load action failed",
        description:
          error instanceof Error
            ? error.message
            : "The CPU load action could not be completed.",
        status: "error",
      });
    },
  });

  const demoError = useMutation({
    mutationFn: () => api.generateErrors(),
    onSuccess: async (data) => {
      addActivity({
        title: "Controlled error action completed",
        description: config.isStaticDemo
          ? `Static preview added a controlled demo error and adjusted mock error metrics. Mock status: HTTP ${data.statusCode}.`
          : `Local API returned the expected controlled demo error. Status: HTTP ${data.statusCode}.`,
        status: "warning",
      });
      await queryClient.invalidateQueries({ queryKey: ["metrics-text"] });
    },
    onError: (error) => {
      addActivity({
        title: "Controlled error action failed",
        description:
          error instanceof Error
            ? error.message
            : "The controlled error action could not be completed.",
        status: "error",
      });
    },
  });

  const demoLog = useMutation({
    mutationFn: () => api.generateLog("info", "Frontend generated demo log"),
    onSuccess: (data) => {
      addActivity({
        title: "Log action completed",
        description: config.isStaticDemo
          ? `Static preview added a mock ${data.level} log entry: "${data.message}".`
          : `Local API emitted a structured ${data.level} log for the Alloy/Loki pipeline: "${data.message}".`,
        status: "success",
      });
    },
    onError: (error) => {
      addActivity({
        title: "Log action failed",
        description:
          error instanceof Error
            ? error.message
            : "The log action could not be completed.",
        status: "error",
      });
    },
  });

  return (
    <div>
      <SectionHeader
        title="Load Test"
        description="Generate metrics, errors, and logs."
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Last Action"
          value={activityEntries[0]?.title ?? "No actions yet"}
          description={activityEntries[0]?.description ?? "Run a demo action"}
        />
        <MetricCard title="CPU Action" value={cpuLoad.status} />
        <MetricCard title="Error Action" value={demoError.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionButton
          label="Generate CPU Load"
          description="POST /load/cpu"
          icon={Activity}
          loading={cpuLoad.isPending}
          onClick={() => cpuLoad.mutate()}
        />
        <ActionButton
          label="Generate Errors"
          description="POST /load/errors"
          icon={AlertTriangle}
          loading={demoError.isPending}
          onClick={() => demoError.mutate()}
        />
        <ActionButton
          label="Generate Logs"
          description="POST /logs/generate"
          icon={FileText}
          loading={demoLog.isPending}
          onClick={() => demoLog.mutate()}
        />
      </div>

      <ActivityConsole entries={activityEntries} className="mt-6" />
    </div>
  );
}
