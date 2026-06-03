import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  },
});
