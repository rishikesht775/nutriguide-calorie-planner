import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test.describe('@database persistence contract', () => {
  test('D1 schema defines one user state row per user', async () => {
    const sql = await readFile(resolve(process.cwd(), 'drizzle/0000_nutriguide.sql'), 'utf8');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS user_state/i);
    expect(sql).toMatch(/user_id TEXT PRIMARY KEY/i);
    expect(sql).toMatch(/state_json TEXT NOT NULL/i);
    expect(sql).toMatch(/updated_at TEXT NOT NULL/i);
    expect(sql).toMatch(/CREATE INDEX IF NOT EXISTS user_state_updated_at_idx/i);
  });

  test('cloud state is never readable without the authenticated user context', async ({ request }) => {
    const response = await request.get('/api/state');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.state ?? {}).toEqual({});
  });
});
