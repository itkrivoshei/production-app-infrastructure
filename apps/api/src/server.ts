import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = await buildApp();

async function shutdown(signal: string) {
  app.runtimeState.shuttingDown = true;
  app.log.info({ signal }, "Graceful shutdown started");

  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error(error, "Graceful shutdown failed");
    process.exit(1);
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));

try {
  await app.listen({
    host: "0.0.0.0",
    port: config.port,
  });

  app.log.info(
    {
      service: config.appName,
      environment: config.appEnv,
      port: config.port,
    },
    "API server started",
  );
} catch (error) {
  app.log.error(error, "Failed to start API server");
  process.exit(1);
}
