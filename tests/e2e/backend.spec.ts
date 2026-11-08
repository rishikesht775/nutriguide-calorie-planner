import { test, expect } from '@playwright/test';

test.describe('@backend API contract and error handling', () => {
  test('me endpoint returns a safe unauthenticated response', async ({ request }) => {
    const response = await request.get('/api/me');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ authenticated: false });
    expect(body.user).toBeNull();
    expect(JSON.stringify(body)).not.toMatch(/password|token|secret/i);
  });

  test('state endpoint rejects unauthenticated reads and writes', async ({ request }) => {
    const read = await request.get('/api/state');
    expect(read.status()).toBe(401);
    const write = await request.post('/api/state', { data: { state: { smoke: true } } });
    expect(write.status()).toBe(401);
  });

  test('state endpoint rejects invalid JSON without exposing internals', async ({ request }) => {
    const response = await request.post('/api/state', {
      headers: { 'content-type': 'application/json' },
      data: '{invalid-json',
    });
    expect([400, 401]).toContain(response.status());
    expect(await response.text()).not.toMatch(/stack|node_modules|SELECT|INSERT/i);
  });

  test('unknown API paths return a controlled response', async ({ request }) => {
    const response = await request.get('/api/does-not-exist');
    expect([404, 405]).toContain(response.status());
  });
});
