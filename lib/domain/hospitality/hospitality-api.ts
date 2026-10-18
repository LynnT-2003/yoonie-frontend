import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";
import type {
  AvailabilityResult,
  Branch,
  CreateHoldBody,
  DispatchStatus,
  DispatchTask,
  HoldResult,
  HousekeepingBoard,
  OrderResponse,
  RestaurantItem,
  RoomCleaningStatus,
  RoomItem,
  ServiceItem,
} from "../../types/hospitality";

export const hospitalityKeys = {
  all: ["hospitality"] as const,
  branches: () => [...hospitalityKeys.all, "branches"] as const,
  branch: (code: string) => [...hospitalityKeys.all, "branch", code] as const,
  housekeeping: (branchId: string) =>
    [...hospitalityKeys.all, "housekeeping", branchId] as const,
  services: (branchId: string) =>
    [...hospitalityKeys.all, "services", branchId] as const,
  restaurants: (branchId: string) =>
    [...hospitalityKeys.all, "restaurants", branchId] as const,
  availability: (branchId: string, roomType: string, checkIn: string, checkOut: string) =>
    [...hospitalityKeys.all, "availability", branchId, roomType, checkIn, checkOut] as const,
  dispatch: (branchId: string, date: string) =>
    [...hospitalityKeys.all, "dispatch", branchId, date] as const,
  order: (orderId: string) =>
    [...hospitalityKeys.all, "order", orderId] as const,
};

// ─── Branches ─────────────────────────────────────────────────────────────────

export async function getBranches(): Promise<Branch[]> {
  return getRequest<Branch[]>(apiPath("branches"), { isPublic: true });
}

export function useBranchesQuery() {
  return useQuery({
    queryKey: hospitalityKeys.branches(),
    queryFn: getBranches,
    staleTime: 60_000,
  });
}

// ─── Housekeeping & Rooms ────────────────────────────────────────────────────

export async function getHousekeepingBoard(branchId: string): Promise<HousekeepingBoard> {
  return getRequest<HousekeepingBoard>(apiPath(`rooms/housekeeping?branchId=${encodeURIComponent(branchId)}`), {
    isPublic: true,
  });
}

export function useHousekeepingBoardQuery(branchId: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: hospitalityKeys.housekeeping(branchId),
    queryFn: () => getHousekeepingBoard(branchId),
    enabled: Boolean(branchId),
    refetchInterval: options?.refetchInterval ?? 15_000,
  });
}

export async function updateRoomCleaning(
  roomId: string,
  cleaningStatus: RoomCleaningStatus
): Promise<RoomItem> {
  return patchRequest<RoomItem, { cleaningStatus: RoomCleaningStatus }>(
    apiPath(`rooms/${roomId}/cleaning`),
    { cleaningStatus }
  );
}

export function useUpdateRoomCleaningMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, status }: { roomId: string; status: RoomCleaningStatus }) =>
      updateRoomCleaning(roomId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.housekeeping(branchId),
      });
    },
  });
}

// ─── Services & Restaurants ──────────────────────────────────────────────────

export async function getServices(branchId: string): Promise<ServiceItem[]> {
  return getRequest<ServiceItem[]>(apiPath(`services?branchId=${encodeURIComponent(branchId)}`), {
    isPublic: true,
  });
}

export function useServicesQuery(branchId: string) {
  return useQuery({
    queryKey: hospitalityKeys.services(branchId),
    queryFn: () => getServices(branchId),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}

export async function getRestaurants(branchId: string): Promise<RestaurantItem[]> {
  return getRequest<RestaurantItem[]>(apiPath(`restaurants?branchId=${encodeURIComponent(branchId)}`), {
    isPublic: true,
  });
}

export function useRestaurantsQuery(branchId: string) {
  return useQuery({
    queryKey: hospitalityKeys.restaurants(branchId),
    queryFn: () => getRestaurants(branchId),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}

// ─── Inventory Availability & Hold ───────────────────────────────────────────

export async function checkRoomAvailability(
  branchId: string,
  roomType: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResult> {
  return getRequest<AvailabilityResult>(
    apiPath(
      `inventory/availability?branchId=${encodeURIComponent(branchId)}&roomType=${encodeURIComponent(
        roomType
      )}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
    ),
    { isPublic: true }
  );
}

export function useRoomAvailabilityQuery(
  branchId: string,
  roomType: string,
  checkIn: string,
  checkOut: string,
  enabled = true
) {
  return useQuery({
    queryKey: hospitalityKeys.availability(branchId, roomType, checkIn, checkOut),
    queryFn: () => checkRoomAvailability(branchId, roomType, checkIn, checkOut),
    enabled: Boolean(branchId && roomType && checkIn && checkOut && enabled),
    staleTime: 20_000,
  });
}

export async function createHold(body: CreateHoldBody): Promise<HoldResult> {
  return postRequest<HoldResult, CreateHoldBody>(apiPath("inventory/hold"), body, {
    isPublic: true,
  });
}

export async function releaseHold(holdId: string): Promise<{ released: boolean }> {
  return deleteRequest<{ released: boolean }>(apiPath(`inventory/hold/${holdId}`));
}

// ─── Orders & Confirmation ───────────────────────────────────────────────────

export async function createOrder(body: Record<string, unknown>): Promise<OrderResponse> {
  return postRequest<OrderResponse, Record<string, unknown>>(apiPath("orders"), body, {
    isPublic: true,
  });
}

export async function confirmOrder(
  orderId: string,
  paymentRef: string,
  paidThb: number
): Promise<OrderResponse> {
  return postRequest<OrderResponse, { paymentRef: string; paidThb: number }>(
    apiPath(`orders/${orderId}/confirm`),
    { paymentRef, paidThb },
    { isPublic: true }
  );
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

export async function getDispatchTasks(
  branchId: string,
  serviceDate: string
): Promise<DispatchTask[]> {
  return getRequest<DispatchTask[]>(
    apiPath(
      `dispatch?branchId=${encodeURIComponent(branchId)}&serviceDate=${encodeURIComponent(serviceDate)}`
    ),
    { isPublic: true }
  );
}

export function useDispatchTasksQuery(branchId: string, serviceDate: string) {
  return useQuery({
    queryKey: hospitalityKeys.dispatch(branchId, serviceDate),
    queryFn: () => getDispatchTasks(branchId, serviceDate),
    enabled: Boolean(branchId && serviceDate),
    refetchInterval: 15_000,
  });
}

export async function updateDispatchStatus(
  taskId: string,
  status: DispatchStatus
): Promise<DispatchTask> {
  return patchRequest<DispatchTask, { status: DispatchStatus }>(
    apiPath(`dispatch/${taskId}/status`),
    { status }
  );
}

export function useUpdateDispatchStatusMutation(branchId: string, serviceDate: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: DispatchStatus }) =>
      updateDispatchStatus(taskId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.dispatch(branchId, serviceDate),
      });
    },
  });
}
