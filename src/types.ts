export type AuthRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  mfaRequired: boolean;
  mfaType?: string | null;
  challengeId?: string | null;
  token?: string | null;
  email?: string | null;
  uuid?: string | null;
};

export type UserProfile = {
  id?: number;
  uuid?: string;
  email?: string;
  nickname?: string;
  avatarUrl?: string;
  headerUrl?: string;
  phoneNumber?: string;
};

export type UpdateProfileRequest = {
  nickname?: string;
  avatarUrl?: string;
  headerUrl?: string;
  phoneNumber?: string;
};

export type ApiError = {
  code?: string;
  message?: string;
};
