import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

export async function readyRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/ready',
    {
      schema: {
        tags: ['system'],
        response: {
          200: Type.Object({
            status: Type.String(),
            checks: Type.Object({
              api: Type.String()
            }),
            timestamp: Type.String()
          })
        }
      }
    },
    async () => {
      return {
        status: 'ready',
        checks: {
          api: 'ok'
        },
        timestamp: new Date().toISOString()
      };
    }
  );
}
