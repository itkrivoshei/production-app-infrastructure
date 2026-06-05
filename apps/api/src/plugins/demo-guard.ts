import type { FastifyReply, FastifyRequest } from "fastify";

const WINDOW_MS = 60_000;

export type DemoGuard = (
  request: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

export function createDemoGuard(limit: number): DemoGuard {
  const requests = new Map<string, number[]>();

  return async function demoGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (request.headers["x-demo-action"] !== "true") {
      await reply.code(403).send({
        status: "forbidden",
        message: "Demo actions require the X-Demo-Action: true header",
      });
      return;
    }

    const now = Date.now();
    const recent = (requests.get(request.ip) ?? []).filter(
      (timestamp) => now - timestamp < WINDOW_MS,
    );

    if (recent.length >= limit) {
      await reply.code(429).send({
        status: "rate_limited",
        message: "Demo action rate limit exceeded",
      });
      return;
    }

    recent.push(now);
    requests.set(request.ip, recent);
  };
}
