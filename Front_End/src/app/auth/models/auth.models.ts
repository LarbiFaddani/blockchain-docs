// src/app/auth/models/auth.models.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ECOLE_ADMIN' | 'ENTREPRISE_ADMIN' | 'ADMIN';
  userId: number;
}
