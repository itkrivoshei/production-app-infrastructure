import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard render failed", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
        <div className="max-w-lg rounded-lg border border-red-400/30 bg-slate-900 p-6">
          <AlertTriangle className="size-6 text-red-300" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-slate-300">
            {this.state.error.message}
          </p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Reload dashboard
          </Button>
        </div>
      </main>
    );
  }
}
