import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function statusRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get(
    '/status',
    {
      schema: {
        tags: ['system'],
        response: {
          200: Type.Object({
            service: Type.String(),
            version: Type.String(),
            commit: Type.String(),
            environment: Type.String(),
            status: Type.String(),
            uptime: Type.Number(),
            timestamp: Type.String()
          })
        }
      }
    },
    async () => {
      return {
        service: config.appName,
        version: config.appVersion,
        commit: config.commitSha,
        environment: config.appEnv,
        status: 'ok',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      };
    }
  );
}
