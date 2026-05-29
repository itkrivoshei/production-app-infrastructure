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
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.appEnv === 'local'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
              }
            }
          : undefined
    }
  });

  await app.register(cors, {
    origin: true
  });

  registerMetrics(app, config);
  await registerSwagger(app, config);

  await app.register(healthRoutes);
  await app.register(readyRoutes);
  await app.register(statusRoutes);
  await app.register(metricsRoutes);
  await app.register(logsRoutes);
  await app.register(async (instance) => versionRoutes(instance, config));
  await app.register(async (instance) => loadRoutes(instance, config));

  return app;
}
