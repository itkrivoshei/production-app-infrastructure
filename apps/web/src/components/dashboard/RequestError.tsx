import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type RequestErrorProps = {
  error: unknown;
  onRetry?: () => void;
  title?: string;
};

export function RequestError({
  error,
  onRetry,
  title = "Request failed",
}: RequestErrorProps) {
  const message =
    error instanceof Error ? error.message : "The request could not be completed.";

  return (
    <Alert variant="destructive" className="mb-4 border-red-400/30 p-4">
      <AlertCircle className="size-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry ? (
        <Button className="mt-3 w-fit" variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </Alert>
  );
}
