import type { AppMetrics } from '../plugins/metrics.js';

declare module 'fastify' {
  interface FastifyInstance {
    metrics: AppMetrics;
  }

  interface FastifyRequest {
    startTime?: bigint;
  }
}
