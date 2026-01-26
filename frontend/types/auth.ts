// frontend/types/auth.ts
export interface User {
  id?: string;
  email: string;
  username: string;
  password?: string;
}

export interface SignUpData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: string;  // UUID of the user
  email: string;
}