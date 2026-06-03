const baseUrl = import.meta.env.BASE_URL ?? "/";
const routerBasename = baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");
const demoMode = import.meta.env.VITE_DEMO_MODE ?? "live";

export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "/api",
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL ?? "/grafana",
  prometheusUrl: import.meta.env.VITE_PROMETHEUS_URL ?? "/prometheus",
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL ?? "/api/docs",
  demoMode,
  isStaticDemo: demoMode === "static",
  routerBasename,
  repositoryUrl:
    import.meta.env.VITE_REPOSITORY_URL ??
    "https://github.com/itkrivoshei/production-app-infrastructure",
};
