const baseUrl = import.meta.env.BASE_URL ?? "/";
const routerBasename = baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");
const demoMode = import.meta.env.VITE_DEMO_MODE ?? "live";
const localServicesAvailable =
  (import.meta.env.VITE_LOCAL_SERVICES_AVAILABLE ?? "true") === "true";

export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "/api",
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL ?? "/grafana",
  prometheusUrl: import.meta.env.VITE_PROMETHEUS_URL ?? "/prometheus",
  lokiUrl: import.meta.env.VITE_LOKI_URL ?? "/loki",
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL ?? "/api/docs",
  demoMode,
  isStaticDemo: demoMode === "static",
  localServicesAvailable,
  routerBasename,
  repositoryUrl:
    import.meta.env.VITE_REPOSITORY_URL ??
    "https://github.com/itkrivoshei/production-app-infrastructure",
  localUrls: {
    apiDocs: "http://localhost:3000/api/docs",
    apiMetrics: "http://localhost:3000/api/metrics",
    grafana: "http://localhost:3001",
    prometheus: "http://localhost:9090",
    loki: "http://localhost:3100",
  },
};
