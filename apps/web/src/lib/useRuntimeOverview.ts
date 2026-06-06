import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { config } from "./config";

export function useRuntimeOverview() {
  const overview = useQuery({
    queryKey: ["overview"],
    queryFn: api.overview,
  });

  return {
    overview,
    demoActionsAvailable:
      config.isStaticDemo || overview.data?.mode === "demo",
  };
}
