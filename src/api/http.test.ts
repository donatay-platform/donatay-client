import { describe, expect, it, vi } from 'vitest';
import { requestJson, resolveErrorMessage } from './http';

describe('requestJson', () => {
  it('returns parsed json on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })));

    await expect(requestJson<{ ok: boolean }>('http://localhost/test')).resolves.toEqual({ ok: true });
  });

  it('throws api message on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Bad request' }), { status: 400 })));

    await expect(requestJson('http://localhost/test')).rejects.toThrow('Bad request');
  });

  it('supports empty 204 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(requestJson<void>('http://localhost/test')).resolves.toBeUndefined();
  });
});

describe('resolveErrorMessage', () => {
  it('falls back to http status when body is not json', async () => {
    const response = new Response('plain text', { status: 500 });

    await expect(resolveErrorMessage(response)).resolves.toBe('HTTP 500');
  });
});
