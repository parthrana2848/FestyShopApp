import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, ForgotPasswordPayload, ForgotPasswordResponse, LoginPayload, RegisterPayload, ResetPasswordPayload, ResetPasswordResponse, User } from '../types/auth';
import { USER_DETAILS_KEY } from '../constants/api';
import apiClient from './axios';

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  console.log("BaseURL", apiClient.defaults.baseURL)
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', payload);
  console.log("get Login Response", data)
  return data;
};

export const googleLoginRequest = async (idToken: string): Promise<AuthResponse> => {

  const { data } = await apiClient.post<AuthResponse>('/api/auth/google', { idToken });
  return data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<AuthResponse> => {
  console.log('Registering user with payload:', payload);
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', payload);
  console.log('Registration response:', data);
  return data;
};

export const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const fetchCurrentUser = async (): Promise<User> => {
  const stored = await AsyncStorage.getItem(USER_DETAILS_KEY);
  if (stored) {
    return JSON.parse(stored) as User;
  }
  return null as unknown as User;
};

export const forgotPasswordRequest = async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
  console.log('Requesting password reset with payload:', payload);
  console.log('API Base URL:', apiClient.defaults.baseURL);
  const { data } = await apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', payload);
  console.log('Forgot password response:', data);
  return data;
};

export const resetPasswordRequest = async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
  const { data } = await apiClient.post<ResetPasswordResponse>('/api/auth/reset-password', payload);
  return data;
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data } = await apiClient.get<{ data: User }>(`/api/users/${userId}`);
    return data.data ?? (data as unknown as User);
  } catch {
    return null;
  }
};
