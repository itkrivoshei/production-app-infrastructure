import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { RequestError } from "@/components/dashboard/RequestError";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRuntimeOverview } from "@/lib/useRuntimeOverview";

type LogEntry = {
  level: string;
  message: string;
  timestamp: string;
};

export function Logs() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const { overview, demoActionsAvailable } = useRuntimeOverview();

  const generateLog = useMutation({
    mutationFn: () =>
      api.generateLog("info", "Manual log generated from dashboard"),
    onSuccess: (data) => {
      setEntries((current) => [data, ...current].slice(0, 10));
    },
  });

  return (
    <div>
      <SectionHeader
        title="Logs"
        description="Structured backend log generation for the observability pipeline."
        action={demoActionsAvailable ? (
          <Button
            onClick={() => generateLog.mutate()}
            disabled={generateLog.isPending}
          >
            <FileText className="size-4" aria-hidden="true" />
            <span>
              {generateLog.isPending ? "Generating" : "Generate Demo Log"}
            </span>
          </Button>
        ) : undefined}
      />

      {overview.isError ? (
        <RequestError
          title="Runtime mode unavailable"
          error={overview.error}
          onRetry={() => void overview.refetch()}
        />
      ) : null}

      {overview.isSuccess && !demoActionsAvailable ? (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">
          Demo log generation is disabled in safe mode. Start the local demo
          profile to emit controlled logs.
        </div>
      ) : null}

      {generateLog.isError ? (
        <RequestError
          title="Demo log generation failed"
          error={generateLog.error}
          onRetry={() => generateLog.mutate()}
        />
      ) : null}

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
            No generated logs yet.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={`${entry.timestamp}-${entry.message}`}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100"
            >
              <div className="text-xs text-slate-400">{entry.timestamp}</div>
              <div className="mt-1">
                [{entry.level}] {entry.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
