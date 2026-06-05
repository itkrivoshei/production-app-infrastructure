import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";
import type { DemoGuard } from "../plugins/demo-guard.js";

const GenerateLogBodySchema = Type.Object({
  level: Type.Optional(
    Type.Union([
      Type.Literal("info"),
      Type.Literal("warn"),
      Type.Literal("error"),
    ]),
  ),
  message: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
});

type GenerateLogBody = Static<typeof GenerateLogBodySchema>;

export async function logsRoutes(
  app: FastifyInstance,
  _config: AppConfig,
  demoGuard: DemoGuard,
): Promise<void> {
  app.post<{ Body: GenerateLogBody }>(
    "/logs/generate",
    {
      schema: {
        tags: ["demo"],
        body: GenerateLogBodySchema,
        response: {
          200: Type.Object({
            status: Type.String(),
            level: Type.String(),
            message: Type.String(),
            timestamp: Type.String(),
          }),
          403: Type.Object({ status: Type.String(), message: Type.String() }),
          429: Type.Object({ status: Type.String(), message: Type.String() }),
        },
      },
      preHandler: demoGuard,
    },
    async (request) => {
      const level = request.body.level ?? "info";
      const message = request.body.message ?? "Demo log generated";

      const logContext = {
        source: "demo",
        route: "/logs/generate",
      };

      switch (level) {
        case "warn":
          app.log.warn(logContext, message);
          break;
        case "error":
          app.log.error(logContext, message);
          break;
        default:
          app.log.info(logContext, message);
      }

      return {
        status: "ok",
        level,
        message,
        timestamp: new Date().toISOString(),
      };
    },
  );
}
