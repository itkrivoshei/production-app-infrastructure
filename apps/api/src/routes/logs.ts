import { Type, type Static } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

const GenerateLogBodySchema = Type.Object({
  level: Type.Optional(Type.Union([
    Type.Literal('info'),
    Type.Literal('warn'),
    Type.Literal('error')
  ])),
  message: Type.Optional(Type.String({ minLength: 1, maxLength: 200 }))
});

type GenerateLogBody = Static<typeof GenerateLogBodySchema>;

export async function logsRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: GenerateLogBody }>(
    '/logs/generate',
    {
      schema: {
        tags: ['demo'],
        body: GenerateLogBodySchema,
        response: {
          200: Type.Object({
            status: Type.String(),
            level: Type.String(),
            message: Type.String(),
            timestamp: Type.String()
          })
        }
      }
    },
    async (request) => {
      const level = request.body.level ?? 'info';
      const message = request.body.message ?? 'Demo log generated';

      app.log[level](
        {
          source: 'demo',
          route: '/logs/generate'
        },
        message
      );

      return {
        status: 'ok',
        level,
        message,
        timestamp: new Date().toISOString()
      };
    }
  );
}
