import { Type } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";

export async function overviewRoutes(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  app.get(
    "/overview",
    {
      schema: {
        tags: ["system"],
        response: {
          200: Type.Object({
            health: Type.Literal("ok"),
            readiness: Type.Union([
              Type.Literal("ready"),
              Type.Literal("not_ready"),
            ]),
            service: Type.String(),
            version: Type.String(),
            commit: Type.String(),
            environment: Type.String(),
            mode: Type.Union([Type.Literal("safe"), Type.Literal("demo")]),
            uptime: Type.Number(),
            requests: Type.Number(),
            http5xx: Type.Number(),
            errorRate: Type.Number(),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      const summary = await app.metrics.summary();

      return {
        health: "ok" as const,
        readiness: app.runtimeState.shuttingDown
          ? ("not_ready" as const)
          : ("ready" as const),
        service: config.appName,
        version: config.appVersion,
        commit: config.commitSha,
        environment: config.appEnv,
        mode: config.appMode,
        uptime: Math.round(process.uptime()),
        ...summary,
        timestamp: new Date().toISOString(),
      };
    },
  );
}
