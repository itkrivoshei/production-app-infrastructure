export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  grafanaUrl: import.meta.env.VITE_GRAFANA_URL ?? '/grafana',
  prometheusUrl: import.meta.env.VITE_PROMETHEUS_URL ?? '/prometheus',
  apiDocsUrl: import.meta.env.VITE_API_DOCS_URL ?? '/api/docs'
};
