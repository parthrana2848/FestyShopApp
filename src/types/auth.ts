import type { ReactNode } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  message?: string
  user: User
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: string; // Optional role field for registration
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type AuthProviderProps = {
  children: ReactNode;
};
