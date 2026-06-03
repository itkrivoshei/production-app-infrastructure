import "dotenv/config";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readLogFormat(
  value: string | undefined,
  appEnv: string,
): "json" | "pretty" {
  if (value === "json" || value === "pretty") return value;
  return appEnv === "local" ? "pretty" : "json";
}

const appEnv = process.env.APP_ENV ?? "local";

export const config = {
  appName: process.env.APP_NAME ?? "devops-control-center-api",
  appVersion: process.env.APP_VERSION ?? "0.1.0",
  appEnv,
  commitSha: process.env.COMMIT_SHA ?? "local",
  port: readNumber(process.env.PORT, 8080),
  logLevel: process.env.LOG_LEVEL ?? "info",
  logFormat: readLogFormat(process.env.LOG_FORMAT, appEnv),
  enableDemoLoad: readBoolean(process.env.ENABLE_DEMO_LOAD, true),
  enableDemoErrors: readBoolean(process.env.ENABLE_DEMO_ERRORS, true),
};

export type AppConfig = typeof config;
