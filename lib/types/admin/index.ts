import type { User } from "../user";

/** Same as `User`; moderation list returns full public profile. */
export type ModerationUser = User;

export type ModerationUserListParams = {
  page: number;
  limit: number;
  search?: string;
  /** Omit to list all users. */
  suspended?: boolean;
};

export type ModerationUserListResult = {
  items: ModerationUser[];
  total: number;
  page: number;
  limit: number;
};

export type SuspendModerationUserBody = {
  reason?: string;
};
