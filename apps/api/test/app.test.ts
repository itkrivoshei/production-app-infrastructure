import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('DevOps Control Center API', () => {
  afterEach(async () => {
    // app.close() is handled per test where needed
  });

  it('returns health status', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok'
    });
  });

  it('returns readiness status', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/ready'
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ready',
      checks: {
        api: 'ok'
      }
    });
  });

  it('returns version metadata', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/version'
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      service: 'devops-control-center-api',
      version: '0.1.0',
      commit: 'local',
      environment: 'local'
    });
  });

  it('returns Prometheus metrics', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/metrics'
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('http_requests_total');
    expect(response.body).toContain('app_info');
  });

  it('generates demo CPU load', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/load/cpu',
      payload: {
        durationMs: 100
      }
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      type: 'cpu'
    });
  });

  it('generates demo logs', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/logs/generate',
      payload: {
        level: 'info',
        message: 'Test demo log'
      }
    });

    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      level: 'info',
      message: 'Test demo log'
    });
  });
});
