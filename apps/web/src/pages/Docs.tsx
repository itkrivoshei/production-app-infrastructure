import { BarChart3, BookOpen, Gauge } from 'lucide-react';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

export function Docs() {
  return (
    <div>
      <SectionHeader title="Docs" description="Local service links and API documentation." />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-cyan-100 text-cyan-800">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold text-slate-950">API Documentation</h2>
          </div>
          <Button className="mt-5" asChild>
            <a href={config.apiDocsUrl} target="_blank" rel="noreferrer">
              <BookOpen className="size-4" aria-hidden="true" />
              <span>Open API Docs</span>
            </a>
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
              <BarChart3 className="size-5" aria-hidden="true" />
            </span>
            <h2 className="font-semibold text-slate-950">Observability Links</h2>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild>
              <a href={config.prometheusUrl} target="_blank" rel="noreferrer">
                <Gauge className="size-4" aria-hidden="true" />
                <span>Prometheus</span>
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={config.grafanaUrl} target="_blank" rel="noreferrer">
                <BarChart3 className="size-4" aria-hidden="true" />
                <span>Grafana</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
