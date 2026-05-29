import type { FastifyInstance } from 'fastify';

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/metrics',
    {
      schema: {
        tags: ['metrics'],
        hide: true
      }
    },
    async (_request, reply) => {
      reply.header('Content-Type', app.metrics.register.contentType);
      return app.metrics.register.metrics();
    }
  );
}
