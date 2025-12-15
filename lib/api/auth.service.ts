// src/lib/api/auth.service.ts

import { authApi } from './client';
import { LoginCredentials, RegisterData, User, AuthTokens } from '@/types/auth.types';

export const authService = {
  async register(data: RegisterData) {
    return authApi.post<{ user: User; verificationToken?: string }>('/auth/register', data);
  },

  async login(credentials: LoginCredentials) {
    return authApi.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials);
  },

  async logout(refreshToken: string) {
    return authApi.post('/auth/logout', { refreshToken });
  },

  async getProfile() {
    return authApi.get<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>) {
    return authApi.put<User>('/auth/me', data);
  },

  async refreshToken(refreshToken: string) {
    return authApi.post<{ accessToken: string }>('/auth/refresh-token', { refreshToken });
  },
};