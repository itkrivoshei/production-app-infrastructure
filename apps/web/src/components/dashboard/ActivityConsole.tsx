import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ActivityEntryStatus = "info" | "success" | "warning" | "error";

export type ActivityEntry = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: ActivityEntryStatus;
};

const statusClassName: Record<ActivityEntryStatus, string> = {
  info: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  error: "border-red-400/30 bg-red-400/10 text-red-100",
};

function formatActivityTime(timestamp: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

type ActivityConsoleProps = {
  entries: ActivityEntry[];
  className?: string;
  emptyMessage?: string;
};

export function ActivityConsole({
  entries,
  className,
  emptyMessage = "Run a demo action to see timestamped results here.",
}: ActivityConsoleProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-800 bg-slate-950 p-4 text-slate-100",
        className,
      )}
      aria-labelledby="activity-console-title"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="activity-console-title" className="text-base font-semibold">
            Activity Console
          </h2>
          <p className="text-sm text-slate-400">
            Demo actions, generated events, and visible metric changes.
          </p>
        </div>
        <Badge className="border-slate-700 bg-slate-900 text-slate-300">
          {entries.length} events
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : (
          entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-md border border-slate-800 bg-slate-900 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-medium text-slate-50">
                  {entry.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className={statusClassName[entry.status]}>
                    {entry.status}
                  </Badge>
                  <time
                    dateTime={entry.timestamp}
                    className="font-mono text-xs text-slate-500"
                  >
                    {formatActivityTime(entry.timestamp)}
                  </time>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {entry.description}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
