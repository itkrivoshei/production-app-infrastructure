import { Activity } from "lucide-react";
import type { ReactNode } from "react";
import { config } from "@/lib/config";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          {config.isStaticDemo ? (
            <div className="border-b border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 sm:px-6 lg:px-8">
              This online demo is a static UI preview. The full observability
              stack runs locally with Docker Compose.
            </div>
          ) : null}
          <header className="flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight text-slate-50">
                DevOps Control Center
              </div>
              <div className="text-xs text-slate-400">
                Production infrastructure
              </div>
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
