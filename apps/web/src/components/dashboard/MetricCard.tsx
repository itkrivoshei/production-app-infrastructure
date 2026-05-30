import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="min-h-32 rounded-lg border-slate-200 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-semibold tracking-normal text-slate-950">
          {value}
        </div>
        {description ? <p className="mt-2 text-xs text-slate-500">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
