import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

const CpuLoadBodySchema = Type.Object({
  durationMs: Type.Optional(Type.Number({ minimum: 100, maximum: 5000 }))
});

type CpuLoadBody = Static<typeof CpuLoadBodySchema>;

function createCpuLoad(durationMs: number): number {
  const end = Date.now() + durationMs;
  let operations = 0;

  while (Date.now() < end) {
    Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
    operations += 1;
  }

  return operations;
}

export async function loadRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.post<{ Body: CpuLoadBody }>(
    '/load/cpu',
    {
      schema: {
        tags: ['demo'],
        body: CpuLoadBodySchema,
        response: {
          200: Type.Object({
            status: Type.String(),
            type: Type.String(),
            durationMs: Type.Number(),
            operations: Type.Number(),
            timestamp: Type.String()
          }),
          403: Type.Object({
            status: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      if (!config.enableDemoLoad) {
        return reply.code(403).send({
          status: 'disabled',
          message: 'Demo load generation is disabled'
        });
      }

      const durationMs = request.body.durationMs ?? 1000;
      const operations = createCpuLoad(durationMs);

      app.metrics.appLoadEventsTotal.inc({ type: 'cpu' });
      app.log.info({ durationMs, operations }, 'Generated demo CPU load');

      return {
        status: 'ok',
        type: 'cpu',
        durationMs,
        operations,
        timestamp: new Date().toISOString()
      };
    }
  );

  app.post(
    '/load/errors',
    {
      schema: {
        tags: ['demo'],
        response: {
          500: Type.Object({
            status: Type.String(),
            message: Type.String(),
            timestamp: Type.String()
          }),
          403: Type.Object({
            status: Type.String(),
            message: Type.String()
          })
        }
      }
    },
    async (_request, reply) => {
      if (!config.enableDemoErrors) {
        return reply.code(403).send({
          status: 'disabled',
          message: 'Demo error generation is disabled'
        });
      }

      app.metrics.appErrorsTotal.inc({
        route: '/load/errors',
        type: 'demo'
      });

      app.log.error({ route: '/load/errors' }, 'Generated demo error');

      return reply.code(500).send({
        status: 'error',
        message: 'Demo error generated intentionally',
        timestamp: new Date().toISOString()
      });
    }
  );
}
