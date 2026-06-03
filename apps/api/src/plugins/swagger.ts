import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config.js";

export async function registerSwagger(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "DevOps Control Center API",
        description:
          "Backend API for health checks, metrics, logs, load testing, and service status.",
        version: config.appVersion,
      },
      tags: [
        { name: "system", description: "System health and version endpoints" },
        { name: "metrics", description: "Prometheus metrics endpoint" },
        { name: "demo", description: "Demo load, error, and log endpoints" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });
}
