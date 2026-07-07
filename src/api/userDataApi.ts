import { USER_DATA_API_URL } from './config';
import { requestJson } from './http';
import type { UpdateProfileRequest, UserProfile } from '../types';

export function getProfile(token: string): Promise<UserProfile> {
  return requestJson(`${USER_DATA_API_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function updateProfile(token: string, request: UpdateProfileRequest): Promise<UserProfile> {
  return requestJson(`${USER_DATA_API_URL}/api/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });
}
