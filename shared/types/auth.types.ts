import { User } from './user.types';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: User;
  accessToken: string;
}

export interface LogoutResponseDTO {
  message: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'UNAUTHORIZED';
