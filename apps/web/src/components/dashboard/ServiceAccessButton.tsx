import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Network, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { config } from "@/lib/config";

type ServiceAccessButtonProps = {
  label: string;
  serviceName: string;
  description: string;
  url: string;
  localUrl: string;
  icon: LucideIcon;
  command?: string;
  docsPath?: string;
  variant?: ComponentProps<typeof Button>["variant"];
};

export function ServiceAccessButton({
  label,
  serviceName,
  description,
  url,
  localUrl,
  icon: Icon,
  command = "COMPOSE_FILE=docker-compose.yml:docker-compose.demo.yml docker compose --profile observability up --build -d",
  docsPath = "docs/demo.md",
  variant = "outline",
}: ServiceAccessButtonProps) {
  const docsUrl = `${config.repositoryUrl}/blob/main/${docsPath}`;

  if (!config.isStaticDemo) {
    return (
      <Button asChild variant={variant}>
        <a href={url} target="_blank" rel="noreferrer">
          <Icon className="size-4" aria-hidden="true" />
          <span>{label}</span>
        </a>
      </Button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={variant}>
          <Icon className="size-4" aria-hidden="true" />
          <span>{label}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="border-slate-800 bg-slate-950 text-slate-100">
        <SheetHeader>
          <SheetTitle className="text-slate-50">{serviceName}</SheetTitle>
          <SheetDescription className="text-slate-400">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 text-sm">
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-3 text-cyan-100">
            This online demo is a static UI preview. The full observability
            stack runs locally with Docker Compose.
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
              <Network className="size-3.5" aria-hidden="true" />
              Local URL
            </div>
            <div className="mt-1 break-all font-mono text-slate-100">
              {localUrl}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-slate-500">
              <Terminal className="size-3.5" aria-hidden="true" />
              Start command
            </div>
            <pre className="mt-2 overflow-auto rounded-md border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-slate-100">
              {command}
            </pre>
          </div>

          <Button asChild className="w-full" variant="secondary">
            <a href={docsUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" aria-hidden="true" />
              <span>Open local demo guide</span>
            </a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
