import cors from '@fastify/cors';
import Fastify from 'fastify';
import { config } from './config.js';
import { registerMetrics } from './plugins/metrics.js';
import { registerSwagger } from './plugins/swagger.js';
import { healthRoutes } from './routes/health.js';
import { loadRoutes } from './routes/load.js';
import { logsRoutes } from './routes/logs.js';
import { metricsRoutes } from './routes/metrics.js';
import { readyRoutes } from './routes/ready.js';
import { statusRoutes } from './routes/status.js';
import { versionRoutes } from './routes/version.js';

export async function buildApp() {
  const logger =
    config.appEnv === 'local'
      ? {
          level: config.logLevel,
          base: {
            service: config.appName,
            environment: config.appEnv,
            version: config.appVersion,
            commit: config.commitSha
          },
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
        }
      : {
          level: config.logLevel,
          base: {
            service: config.appName,
            environment: config.appEnv,
            version: config.appVersion,
            commit: config.commitSha
          }
        };

  const app = Fastify({
    logger
  });

  await app.register(cors, {
    origin: true
  });

  registerMetrics(app, config);
  await registerSwagger(app, config);

  await healthRoutes(app);
  await readyRoutes(app);
  await statusRoutes(app, config);
  await metricsRoutes(app);
  await logsRoutes(app);
  await versionRoutes(app, config);
  await loadRoutes(app, config);

  return app;
}
