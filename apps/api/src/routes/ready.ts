import { Type } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";

export async function readyRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/ready",
    {
      schema: {
        tags: ["system"],
        response: {
          200: Type.Object({
            status: Type.String(),
            checks: Type.Object({
              api: Type.String(),
            }),
            timestamp: Type.String(),
          }),
          503: Type.Object({
            status: Type.String(),
            checks: Type.Object({
              api: Type.String(),
            }),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async (_request, reply) => {
      if (app.runtimeState.shuttingDown) {
        return reply.code(503).send({
          status: "not_ready",
          checks: {
            api: "shutting_down",
          },
          timestamp: new Date().toISOString(),
        });
      }

      return {
        status: "ready",
        checks: {
          api: "ok",
        },
        timestamp: new Date().toISOString(),
      };
    },
  );
}
