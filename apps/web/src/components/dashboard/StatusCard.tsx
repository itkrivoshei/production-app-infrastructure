import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusCardProps = {
  title: string;
  value: string;
  status?: "ok" | "warning" | "error" | "unknown";
  description?: string;
};

const statusLabel = {
  ok: "OK",
  warning: "Warning",
  error: "Error",
  unknown: "Unknown",
};

const statusClassName = {
  ok: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  error: "border-red-400/30 bg-red-400/10 text-red-100",
  unknown: "border-slate-700 bg-slate-800 text-slate-300",
};

export function StatusCard({
  title,
  value,
  status = "unknown",
  description,
}: StatusCardProps) {
  return (
    <Card className="min-h-36 rounded-lg border border-slate-800 bg-slate-900 shadow-none transition-[border-color,box-shadow] duration-200 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-950/20 motion-safe:transition-[border-color,box-shadow,transform] motion-safe:hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Badge className={statusClassName[status]}>{statusLabel[status]}</Badge>
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-semibold tracking-normal text-slate-50">
          {value}
        </div>
        {description ? (
          <p className="mt-2 text-xs text-slate-400">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
