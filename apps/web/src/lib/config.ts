export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL ?? 'http://localhost:3001',
  prometheusUrl: import.meta.env.VITE_PROMETHEUS_URL ?? 'http://localhost:9090',
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL ?? 'http://localhost:8080/docs'
};
