import type { User } from "../user";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  email: string;
  password: string;
  displayName: string;
};

export type LogoutBody = {
  userId: string;
  refreshToken: string;
};
