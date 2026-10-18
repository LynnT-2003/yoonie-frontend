import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postFileRequest,
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
  rooms: (branchId: string) => [...hospitalityKeys.all, "rooms", branchId] as const,
  room: (roomId: string) => [...hospitalityKeys.all, "room", roomId] as const,
  housekeeping: (branchId: string) =>
    [...hospitalityKeys.all, "housekeeping", branchId] as const,
  services: (branchId: string) =>
    [...hospitalityKeys.all, "services", branchId] as const,
  service: (serviceId: string) =>
    [...hospitalityKeys.all, "service", serviceId] as const,
  restaurants: (branchId: string) =>
    [...hospitalityKeys.all, "restaurants", branchId] as const,
  restaurant: (restaurantId: string) =>
    [...hospitalityKeys.all, "restaurant", restaurantId] as const,
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

export async function createBranch(body: Record<string, unknown>): Promise<Branch> {
  return postRequest<Branch, Record<string, unknown>>(apiPath("branches"), body);
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.branches() });
    },
  });
}

export async function uploadBranchLogo(idOrCode: string, file: File): Promise<Branch> {
  const formData = new FormData();
  formData.append("logo", file);
  return postFileRequest<Branch>(apiPath(`branches/${idOrCode}/logo`), formData);
}

export async function uploadBranchImages(idOrCode: string, files: File[]): Promise<Branch> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return postFileRequest<Branch>(apiPath(`branches/${idOrCode}/images`), formData);
}

export async function deleteBranchImage(idOrCode: string, imageUrl: string): Promise<Branch> {
  return deleteRequest<Branch>(
    apiPath(`branches/${idOrCode}/images?imageUrl=${encodeURIComponent(imageUrl)}`)
  );
}

// ─── Housekeeping & Rooms ────────────────────────────────────────────────────

export async function getRooms(
  branchId: string,
  roomType?: string,
  cleaningStatus?: string
): Promise<RoomItem[]> {
  let url = `rooms?branchId=${encodeURIComponent(branchId)}`;
  if (roomType) url += `&roomType=${encodeURIComponent(roomType)}`;
  if (cleaningStatus) url += `&cleaningStatus=${encodeURIComponent(cleaningStatus)}`;
  return getRequest<RoomItem[]>(apiPath(url), { isPublic: true });
}

export function useRoomsQuery(branchId: string, roomType?: string, cleaningStatus?: string) {
  return useQuery({
    queryKey: [...hospitalityKeys.rooms(branchId), roomType, cleaningStatus],
    queryFn: () => getRooms(branchId, roomType, cleaningStatus),
    enabled: Boolean(branchId),
    staleTime: 30_000,
  });
}

export async function createRoom(body: Record<string, unknown>): Promise<RoomItem> {
  return postRequest<RoomItem, Record<string, unknown>>(apiPath("rooms"), body);
}

export function useCreateRoomMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.rooms(branchId) });
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.housekeeping(branchId) });
    },
  });
}

export async function uploadRoomImages(
  roomId: string,
  files: File[],
  isCover = false
): Promise<RoomItem> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return postFileRequest<RoomItem>(
    apiPath(`rooms/${roomId}/images?isCover=${isCover}`),
    formData
  );
}

export async function deleteRoomImage(roomId: string, imageUrl: string): Promise<RoomItem> {
  return deleteRequest<RoomItem>(
    apiPath(`rooms/${roomId}/images?imageUrl=${encodeURIComponent(imageUrl)}`)
  );
}

export async function getHousekeepingBoard(branchId: string): Promise<HousekeepingBoard> {
  return getRequest<HousekeepingBoard>(apiPath(`rooms/housekeeping?branchId=${encodeURIComponent(branchId)}`));
}

export function useHousekeepingBoardQuery(branchId: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: hospitalityKeys.housekeeping(branchId),
    queryFn: () => getHousekeepingBoard(branchId),
    enabled: Boolean(branchId),
    refetchInterval: options?.refetchInterval ?? 15_000,
  });
}

export async function getRoom(roomId: string): Promise<RoomItem> {
  return getRequest<RoomItem>(apiPath(`rooms/${roomId}`), { isPublic: true });
}

export function useRoomQuery(roomId: string) {
  return useQuery({
    queryKey: hospitalityKeys.room(roomId),
    queryFn: () => getRoom(roomId),
    enabled: Boolean(roomId),
  });
}

export async function updateRoom(
  roomId: string,
  body: Record<string, unknown>
): Promise<RoomItem> {
  return patchRequest<RoomItem, Record<string, unknown>>(apiPath(`rooms/${roomId}`), body);
}

export function useUpdateRoomMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: Record<string, unknown> }) =>
      updateRoom(roomId, data),
    onSuccess: (updatedRoom) => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.rooms(branchId) });
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.housekeeping(branchId) });
      if (updatedRoom?._id) {
        void queryClient.invalidateQueries({ queryKey: hospitalityKeys.room(updatedRoom._id) });
      }
    },
  });
}

export async function updateRoomCleaning(
  roomId: string,
  cleaningStatus: RoomCleaningStatus
): Promise<RoomItem> {
  return postRequest<RoomItem, { toStatus: RoomCleaningStatus }>(
    apiPath(`staff/rooms/${roomId}/transition`),
    { toStatus: cleaningStatus }
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
      void queryClient.invalidateQueries({
        queryKey: hospitalityKeys.rooms(branchId),
      });
    },
  });
}

// ─── Services & Restaurants ──────────────────────────────────────────────────

export async function getServices(branchId: string, category?: string): Promise<ServiceItem[]> {
  let url = `services?branchId=${encodeURIComponent(branchId)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  return getRequest<ServiceItem[]>(apiPath(url), { isPublic: true });
}

export function useServicesQuery(branchId: string, category?: string) {
  return useQuery({
    queryKey: [...hospitalityKeys.services(branchId), category],
    queryFn: () => getServices(branchId, category),
    enabled: Boolean(branchId),
    staleTime: 60_000,
  });
}

export async function createService(body: Record<string, unknown>): Promise<ServiceItem> {
  return postRequest<ServiceItem, Record<string, unknown>>(apiPath("services"), body);
}

export function useCreateServiceMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.services(branchId) });
    },
  });
}

export async function getService(serviceId: string): Promise<ServiceItem> {
  return getRequest<ServiceItem>(apiPath(`services/${serviceId}`), { isPublic: true });
}

export function useServiceQuery(serviceId: string) {
  return useQuery({
    queryKey: hospitalityKeys.service(serviceId),
    queryFn: () => getService(serviceId),
    enabled: Boolean(serviceId),
  });
}

export async function updateService(
  serviceId: string,
  body: Record<string, unknown>
): Promise<ServiceItem> {
  return patchRequest<ServiceItem, Record<string, unknown>>(apiPath(`services/${serviceId}`), body);
}

export function useUpdateServiceMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: Record<string, unknown> }) =>
      updateService(serviceId, data),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.services(branchId) });
      if (updated?._id) {
        void queryClient.invalidateQueries({ queryKey: hospitalityKeys.service(updated._id) });
      }
    },
  });
}

export async function uploadServiceImages(
  serviceId: string,
  files: File[],
  isCover = false
): Promise<ServiceItem> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return postFileRequest<ServiceItem>(
    apiPath(`services/${serviceId}/images?isCover=${isCover}`),
    formData
  );
}

export async function deleteServiceImage(serviceId: string, imageUrl: string): Promise<ServiceItem> {
  return deleteRequest<ServiceItem>(
    apiPath(`services/${serviceId}/images?imageUrl=${encodeURIComponent(imageUrl)}`)
  );
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

export async function getRestaurant(restaurantId: string): Promise<RestaurantItem> {
  return getRequest<RestaurantItem>(apiPath(`restaurants/${restaurantId}`), { isPublic: true });
}

export function useRestaurantQuery(restaurantId: string) {
  return useQuery({
    queryKey: hospitalityKeys.restaurant(restaurantId),
    queryFn: () => getRestaurant(restaurantId),
    enabled: Boolean(restaurantId),
  });
}

export async function updateRestaurant(
  restaurantId: string,
  body: Record<string, unknown>
): Promise<RestaurantItem> {
  return patchRequest<RestaurantItem, Record<string, unknown>>(apiPath(`restaurants/${restaurantId}`), body);
}

export function useUpdateRestaurantMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: Record<string, unknown> }) =>
      updateRestaurant(restaurantId, data),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.restaurants(branchId) });
      if (updated?._id) {
        void queryClient.invalidateQueries({ queryKey: hospitalityKeys.restaurant(updated._id) });
      }
    },
  });
}

export async function createRestaurant(body: Record<string, unknown>): Promise<RestaurantItem> {
  return postRequest<RestaurantItem, Record<string, unknown>>(apiPath("restaurants"), body);
}

export function useCreateRestaurantMutation(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: hospitalityKeys.restaurants(branchId) });
    },
  });
}

export async function uploadRestaurantImages(
  restaurantId: string,
  files: File[],
  isCover = false
): Promise<RestaurantItem> {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return postFileRequest<RestaurantItem>(
    apiPath(`restaurants/${restaurantId}/images?isCover=${isCover}`),
    formData
  );
}

export async function deleteRestaurantImage(
  restaurantId: string,
  imageUrl: string
): Promise<RestaurantItem> {
  return deleteRequest<RestaurantItem>(
    apiPath(`restaurants/${restaurantId}/images?imageUrl=${encodeURIComponent(imageUrl)}`)
  );
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

export async function releaseHold(holdId: string, holdToken?: string): Promise<{ released: boolean }> {
  const query = holdToken ? `?token=${encodeURIComponent(holdToken)}` : "";
  return deleteRequest<{ released: boolean }>(apiPath(`inventory/hold/${holdId}${query}`));
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
    )
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
