import type { AppMetrics } from "../plugins/metrics.js";

declare module "fastify" {
  interface FastifyInstance {
    metrics: AppMetrics;
    runtimeState: {
      shuttingDown: boolean;
    };
  }

  interface FastifyRequest {
    startTime?: bigint;
  }
}
