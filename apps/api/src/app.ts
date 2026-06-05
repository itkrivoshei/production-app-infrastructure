import Fastify from "fastify";
import { config as defaultConfig, type AppConfig } from "./config.js";
import { registerMetrics } from "./plugins/metrics.js";
import { registerSwagger } from "./plugins/swagger.js";
import { createDemoGuard } from "./plugins/demo-guard.js";
import { healthRoutes } from "./routes/health.js";
import { loadRoutes } from "./routes/load.js";
import { logsRoutes } from "./routes/logs.js";
import { metricsRoutes } from "./routes/metrics.js";
import { overviewRoutes } from "./routes/overview.js";
import { readyRoutes } from "./routes/ready.js";
import { statusRoutes } from "./routes/status.js";
import { versionRoutes } from "./routes/version.js";

export async function buildApp(config: AppConfig = defaultConfig) {
  const logger =
    config.logFormat === "pretty"
      ? {
          level: config.logLevel,
          base: {
            service: config.appName,
            environment: config.appEnv,
            version: config.appVersion,
            commit: config.commitSha,
          },
          transport: {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          },
        }
      : {
          level: config.logLevel,
          base: {
            service: config.appName,
            environment: config.appEnv,
            version: config.appVersion,
            commit: config.commitSha,
          },
        };

  const app = Fastify({
    logger,
  });

  app.decorate("runtimeState", {
    shuttingDown: false,
  });

  registerMetrics(app, config);
  await registerSwagger(app, config);

  await healthRoutes(app);
  await readyRoutes(app);
  await statusRoutes(app, config);
  await overviewRoutes(app, config);
  await metricsRoutes(app);
  await versionRoutes(app, config);

  if (config.appMode === "demo") {
    const demoGuard = createDemoGuard(config.demoRateLimit);
    await logsRoutes(app, config, demoGuard);
    await loadRoutes(app, config, demoGuard);
  }

  return app;
}
