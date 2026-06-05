import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { config } from "./lib/config";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {config.isStaticDemo ? (
          <HashRouter>
            <App />
          </HashRouter>
        ) : (
          <BrowserRouter basename={config.routerBasename}>
            <App />
          </BrowserRouter>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
