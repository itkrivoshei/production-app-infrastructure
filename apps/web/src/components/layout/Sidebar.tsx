import {
  Activity,
  BarChart3,
  FileText,
  Gauge,
  Home,
  ScrollText,
  Server
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Overview', icon: Home },
  { to: '/metrics', label: 'Metrics', icon: BarChart3 },
  { to: '/logs', label: 'Logs', icon: ScrollText },
  { to: '/load-test', label: 'Load Test', icon: Gauge },
  { to: '/system', label: 'System Info', icon: Server },
  { to: '/docs', label: 'Docs', icon: FileText }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 text-slate-100 lg:block">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <Activity className="size-5" aria-hidden="true" />
          </span>
          <div>
            <div className="text-sm font-semibold leading-tight">DevOps Control Center</div>
            <div className="mt-1 text-xs text-slate-400">Production infrastructure</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 p-3" aria-label="Primary navigation">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
