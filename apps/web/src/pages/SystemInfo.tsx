import { useQuery } from '@tanstack/react-query';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { api } from '@/lib/api';

export function SystemInfo() {
  const status = useQuery({ queryKey: ['status'], queryFn: api.status });

  return (
    <div>
      <SectionHeader title="System Info" description="Runtime metadata from GET /status." />

      <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        {JSON.stringify(status.data ?? { status: 'loading' }, null, 2)}
      </pre>
    </div>
  );
}
