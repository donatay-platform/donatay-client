import { AUTH_API_URL } from './config';
import { requestJson } from './http';
import type { AuthRequest, LoginResponse } from '../types';

export function register(request: AuthRequest): Promise<{ uuid: string; email: string; role: string }> {
  return requestJson(`${AUTH_API_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function login(request: AuthRequest): Promise<LoginResponse> {
  return requestJson(`${AUTH_API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

export function verifyMfa(challengeId: string, code: string): Promise<LoginResponse> {
  return requestJson(`${AUTH_API_URL}/api/auth/login/verify-mfa`, {
    method: 'POST',
    body: JSON.stringify({ challengeId, code })
  });
}
