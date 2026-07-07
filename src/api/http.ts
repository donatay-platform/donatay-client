import type { ApiError } from '../types';

export async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(await resolveErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function resolveErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.message || body.code || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}
