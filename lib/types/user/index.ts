export enum UserRoleEnum {
  USER = "user",
  ADMIN = "admin",
  BRANCH_MGR = "BRANCH_MGR",
  DISPATCHER = "DISPATCHER",
  STAFF = "STAFF",
  GUEST = "GUEST",
}

export type UserRole =
  | "user"
  | "admin"
  | "BRANCH_MGR"
  | "DISPATCHER"
  | "STAFF"
  | "GUEST";

export type UserProviderDetail = {
  provider: string;
  connectedAt: string;
};

/** Mirrors Nest `IUserPublic` / `UserPublicDto`. */
export type User = {
  _id: string;
  email: string | null;
  displayName: string;
  avatar: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  providers: string[];
  providerDetails?: UserProviderDetail[];
  isSuspended: boolean;
  suspensionReason: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileBody = {
  displayName?: string;
  avatar?: string | null;
};
