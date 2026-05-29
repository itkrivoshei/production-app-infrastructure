import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function versionRoutes(app: FastifyInstance, config: AppConfig): Promise<void> {
  app.get(
    '/version',
    {
      schema: {
        tags: ['system'],
        response: {
          200: Type.Object({
            service: Type.String(),
            version: Type.String(),
            commit: Type.String(),
            environment: Type.String()
          })
        }
      }
    },
    async () => {
      return {
        service: config.appName,
        version: config.appVersion,
        commit: config.commitSha,
        environment: config.appEnv
      };
    }
  );
}
