import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="min-h-32 rounded-lg border border-slate-800 bg-slate-900 shadow-none transition-[border-color,box-shadow] duration-200 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-950/20 motion-safe:transition-[border-color,box-shadow,transform] motion-safe:hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
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
