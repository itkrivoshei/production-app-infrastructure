import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        response: {
          200: Type.Object({
            status: Type.String(),
            uptime: Type.Number(),
            timestamp: Type.String()
          })
        }
      }
    },
    async () => {
      return {
        status: 'ok',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      };
    }
  );
}
