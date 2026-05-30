import { Activity } from 'lucide-react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-md bg-slate-950 text-cyan-300">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight">DevOps Control Center</div>
              <div className="text-xs text-slate-500">Production infrastructure</div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
