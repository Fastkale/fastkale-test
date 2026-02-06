// Minimal types for test harness — matches backend API shapes

export interface ApiSuccess<T = unknown> {
  status: 'success';
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  status: 'error';
  error: { code: string; message: string; details?: string };
  timestamp: string;
  request_id?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthData {
  user: UserProfile;
  session: AuthSession;
}

export type DeviceType = 'mobile' | 'laptop';
