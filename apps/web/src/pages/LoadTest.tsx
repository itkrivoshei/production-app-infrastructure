import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Activity, AlertTriangle, FileText } from 'lucide-react';
import { ActionButton } from '@/components/dashboard/ActionButton';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { api } from '@/lib/api';

export function LoadTest() {
  const [lastAction, setLastAction] = useState('No actions yet');

  const cpuLoad = useMutation({
    mutationFn: () => api.generateCpuLoad(1000),
    onSuccess: (data) => {
      setLastAction(`CPU load: ${data.operations.toLocaleString()} operations`);
    }
  });

  const demoError = useMutation({
    mutationFn: () => api.generateErrors(),
    onSuccess: (data) => {
      setLastAction(`Intentional error: HTTP ${data.statusCode}`);
    }
  });

  const demoLog = useMutation({
    mutationFn: () => api.generateLog('info', 'Frontend generated demo log'),
    onSuccess: (data) => {
      setLastAction(`Log: ${data.message}`);
    }
  });

  return (
    <div>
      <SectionHeader title="Load Test" description="Generate metrics, errors, and logs." />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <MetricCard title="Last Action" value={lastAction} />
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
    </div>
  );
}
