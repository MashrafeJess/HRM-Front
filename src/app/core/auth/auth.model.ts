export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}
