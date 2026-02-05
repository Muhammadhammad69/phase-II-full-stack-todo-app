// frontend/types/auth.ts
export interface User {
  id: string;
  email:string;
  name: string;
  password: string;
  createdAt: string | null;
  updatedAt?: string | null;
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
  name: string; // Username of the user
  createdAt: string | null; // Account creation date as ISO string
  updatedAt?: string | null; // Optional account update date as ISO string
}