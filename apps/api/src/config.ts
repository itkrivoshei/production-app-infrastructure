import "dotenv/config";

export type AppMode = "safe" | "demo";
export type LogFormat = "json" | "pretty";

export type AppConfig = {
  appName: string;
  appVersion: string;
  appEnv: string;
  appMode: AppMode;
  commitSha: string;
  port: number;
  logLevel: string;
  logFormat: LogFormat;
  demoRateLimit: number;
};

function readInteger(
  value: string | undefined,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value === "") return fallback;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }

  return parsed;
}

function readMode(value: string | undefined): AppMode {
  const mode = value ?? "safe";

  if (mode !== "safe" && mode !== "demo") {
    throw new Error("APP_MODE must be either safe or demo");
  }

  return mode;
}

function readLogFormat(value: string | undefined, appEnv: string): LogFormat {
  if (value === undefined || value === "") {
    return appEnv === "local" ? "pretty" : "json";
  }

  if (value !== "json" && value !== "pretty") {
    throw new Error("LOG_FORMAT must be either json or pretty");
  }

  return value;
}

export function createConfig(
  environment: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const appEnv = environment.APP_ENV ?? "local";

  return {
    appName: environment.APP_NAME ?? "devops-control-center-api",
    appVersion: environment.APP_VERSION ?? "0.1.0",
    appEnv,
    appMode: readMode(environment.APP_MODE),
    commitSha: environment.COMMIT_SHA ?? "local",
    port: readInteger(environment.PORT, 8080, "PORT", 1, 65_535),
    logLevel: environment.LOG_LEVEL ?? "info",
    logFormat: readLogFormat(environment.LOG_FORMAT, appEnv),
    demoRateLimit: readInteger(
      environment.DEMO_RATE_LIMIT,
      10,
      "DEMO_RATE_LIMIT",
      1,
      1_000,
    ),
  };
}

export const config = createConfig();
