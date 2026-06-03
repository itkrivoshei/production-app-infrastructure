import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = await buildApp();

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
