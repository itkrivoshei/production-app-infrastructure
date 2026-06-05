import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("live API client", () => {
  it("sends the explicit demo action header", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          type: "cpu",
          durationMs: 100,
          operations: 42,
          timestamp: "2026-06-05T00:00:00.000Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.generateCpuLoad(100);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/load/cpu",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Demo-Action": "true",
        }),
      }),
    );
  });

  it("rejects a response that is not the expected controlled HTTP 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "forbidden",
            message: "Demo actions are disabled",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(api.generateErrors()).rejects.toThrow(
      "Demo actions are disabled",
    );
  });
});
