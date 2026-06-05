import { Type, type Static } from "@sinclair/typebox";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";
import { createCpuLoad } from "../lib/cpu-load.js";
import type { DemoGuard } from "../plugins/demo-guard.js";

const CpuLoadBodySchema = Type.Object({
  durationMs: Type.Optional(Type.Number({ minimum: 100, maximum: 5000 })),
});

type CpuLoadBody = Static<typeof CpuLoadBodySchema>;

export async function loadRoutes(
  app: FastifyInstance,
  config: AppConfig,
  demoGuard: DemoGuard,
): Promise<void> {
  let cpuLoadPending = false;

  app.post<{ Body: CpuLoadBody }>(
    "/load/cpu",
    {
      schema: {
        tags: ["demo"],
        body: CpuLoadBodySchema,
        response: {
          200: Type.Object({
            status: Type.String(),
            type: Type.String(),
            durationMs: Type.Number(),
            operations: Type.Number(),
            timestamp: Type.String(),
          }),
          409: Type.Object({
            status: Type.String(),
            message: Type.String(),
          }),
          403: Type.Object({ status: Type.String(), message: Type.String() }),
          429: Type.Object({ status: Type.String(), message: Type.String() }),
        },
      },
      preHandler: demoGuard,
    },
    async (request, reply) => {
      if (cpuLoadPending) {
        return reply.code(409).send({
          status: "busy",
          message: "A CPU load action is already running",
        });
      }

      const durationMs = request.body.durationMs ?? 1000;
      cpuLoadPending = true;

      let operations: number;
      try {
        operations = await createCpuLoad(durationMs);
      } finally {
        cpuLoadPending = false;
      }

      app.metrics.appLoadEventsTotal.inc({ type: "cpu" });
      app.log.info({ durationMs, operations }, "Generated demo CPU load");

      return {
        status: "ok",
        type: "cpu",
        durationMs,
        operations,
        timestamp: new Date().toISOString(),
      };
    },
  );

  app.post(
    "/load/errors",
    {
      schema: {
        tags: ["demo"],
        response: {
          500: Type.Object({
            status: Type.String(),
            message: Type.String(),
            timestamp: Type.String(),
          }),
          403: Type.Object({
            status: Type.String(),
            message: Type.String(),
          }),
          429: Type.Object({ status: Type.String(), message: Type.String() }),
        },
      },
      preHandler: demoGuard,
    },
    async (_request, reply) => {
      app.metrics.appErrorsTotal.inc({
        route: "/load/errors",
        type: "demo",
      });

      app.log.error({ route: "/load/errors" }, "Generated demo error");

      return reply.code(500).send({
        status: "error",
        message: "Demo error generated intentionally",
        timestamp: new Date().toISOString(),
      });
    },
  );
}
