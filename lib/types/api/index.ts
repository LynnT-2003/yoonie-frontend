export type ApiResponse<T> = {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
};

/** JSON error body from Nest `HttpExceptionFilter`; the client throws `ApiError`. */
export type ApiErrorBody = {
  success: false;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
};

export type {
  AuthResponse,
  AuthTokens,
  LoginBody,
  LogoutBody,
  RegisterBody,
} from "../auth";
export type {
  ModerationUser,
  ModerationUserListParams,
  ModerationUserListResult,
  SuspendModerationUserBody,
} from "../admin";
export type {
  BillingPortalSession,
  CheckoutSession,
  CreateBillingPortalSessionBody,
  CreateCheckoutSessionBody,
  PaymentPlanId,
  UserPlan,
} from "../payment";
export type {
  UpdateProfileBody,
  User,
  UserProviderDetail,
  UserRole,
} from "../user";
export type {
  DeleteImageBody,
  DeleteImageResult,
  UploadImageResult,
} from "../upload";
