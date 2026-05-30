import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StatusCardProps = {
  title: string;
  value: string;
  status?: 'ok' | 'warning' | 'error' | 'unknown';
  description?: string;
};

const statusLabel = {
  ok: 'OK',
  warning: 'Warning',
  error: 'Error',
  unknown: 'Unknown'
};

const statusClassName = {
  ok: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  unknown: 'bg-slate-100 text-slate-700'
};

export function StatusCard({ title, value, status = 'unknown', description }: StatusCardProps) {
  return (
    <Card className="min-h-36 rounded-lg border-slate-200 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Badge className={statusClassName[status]}>{statusLabel[status]}</Badge>
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
