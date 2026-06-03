import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionButtonProps = {
  label: string;
  description?: string;
  loading?: boolean;
  icon: LucideIcon;
  onClick: () => void;
};

export function ActionButton({
  label,
  description,
  loading = false,
  icon: Icon,
  onClick,
}: ActionButtonProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex min-h-14 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-medium text-slate-950">{label}</h3>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      <Button className="w-full" onClick={onClick} disabled={loading}>
        <Icon className="size-4" aria-hidden="true" />
        <span>{loading ? "Running..." : label}</span>
      </Button>
    </div>
  );
}
