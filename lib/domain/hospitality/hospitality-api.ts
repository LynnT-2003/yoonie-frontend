import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postFileRequest,
  postRequest,
} from "../api/NetworkManager";
import { apiPath } from "../../config/api-path";
import type {
  AssignTaskResult,
  PickupStage,
  PickupStepResult,
  RoomTransitionResult,
  AvailabilityResult,
  Branch,
  CreateHoldBody,
  DispatchTask,
  HoldResult,
  HousekeepingBoard,
  GuestsBoard,
  LiveOccupancyResponse,
  ServicesBoard,
  OrderResponse,
  PaymentMethod,
  RosterMember,
  TourDecision,
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
  liveOccupancy: (
    branchId: string,
    params?: { date?: string; from?: string; to?: string }
  ) => [...hospitalityKeys.all, "live-occupancy", branchId, params] as const,
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

/**
 * The one way to change a room's cleaning status: the room and its turnaround task move
 * together on the server. Sending a room back to DIRTY needs a reason.
 */
export async function transitionRoom(
  roomId: string,
  toStatus: RoomCleaningStatus,
  reason?: string
): Promise<RoomTransitionResult> {
  return postRequest<RoomTransitionResult, { toStatus: RoomCleaningStatus; reason?: string }>(
    apiPath(`staff/rooms/${roomId}/transition`),
    { toStatus, ...(reason ? { reason } : {}) }
  );
}

export function useRoomTransitionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, toStatus, reason }: { roomId: string; toStatus: RoomCleaningStatus; reason?: string }) =>
      transitionRoom(roomId, toStatus, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalityKeys.all }),
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

export async function createOrder(
  body: Record<string, unknown>
): Promise<{ order: OrderResponse; orderToken: string }> {
  return postRequest<{ order: OrderResponse; orderToken: string }, Record<string, unknown>>(apiPath("orders"), body, {
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

// Task actions. Turnaround status is never set here: rooms move through transitionRoom.

function useTaskAction<V, R>(fn: (vars: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hospitalityKeys.all }),
  });
}

export const useClaimTaskMutation = () =>
  useTaskAction((taskId: string) => postRequest<DispatchTask, object>(apiPath(`dispatch/${taskId}/claim`), {}));

export const useAssignTaskMutation = () =>
  useTaskAction(({ taskId, assigneeUserId }: { taskId: string; assigneeUserId: string | null }) =>
    patchRequest<AssignTaskResult, { assigneeUserId: string | null }>(apiPath(`dispatch/${taskId}/assign`), {
      assigneeUserId,
    })
  );

/** Record a pickup step for a driver who phoned it in; normally the driver taps it in the app. */
export const usePickupStepMutation = () =>
  useTaskAction(({ taskId, stage, note }: { taskId: string; stage: PickupStage; note?: string }) =>
    postRequest<PickupStepResult, { stage: PickupStage; note?: string }>(apiPath(`staff/pickups/${taskId}/step`), {
      stage,
      ...(note ? { note } : {}),
    })
  );

/** The desk's answer to a driver's problem report. */
export const useResolvePickupIssueMutation = () =>
  useTaskAction(
    ({ taskId, resolution, note }: { taskId: string; resolution: "KEEP_WAITING" | "NO_SHOW"; note?: string }) =>
      postRequest<AssignTaskResult, { resolution: string; note?: string }>(apiPath(`dispatch/${taskId}/pickup-issue`), {
        resolution,
        ...(note ? { note } : {}),
      })
  );

export const useTourDecisionMutation = () =>
  useTaskAction(({ taskId, decision, note }: { taskId: string; decision: TourDecision; note?: string }) =>
    postRequest<DispatchTask, { decision: TourDecision; note?: string }>(apiPath(`dispatch/${taskId}/decision`), {
      decision,
      ...(note ? { note } : {}),
    })
  );

export function useStaffRosterQuery(branchId: string) {
  return useQuery({
    queryKey: [...hospitalityKeys.all, "roster", branchId] as const,
    queryFn: () => getRequest<RosterMember[]>(apiPath(`staff/roster?branchId=${encodeURIComponent(branchId)}`)),
    enabled: Boolean(branchId),
    staleTime: 5 * 60_000,
  });
}

export async function getLiveRoomOccupancy(
  branchId: string,
  params?: { date?: string; from?: string; to?: string }
): Promise<LiveOccupancyResponse> {
  const query = new URLSearchParams();
  if (branchId) query.set("branchId", branchId);
  if (params?.date) query.set("date", params.date);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  const qStr = query.toString();
  return getRequest<LiveOccupancyResponse>(apiPath(`rooms/live-occupancy${qStr ? `?${qStr}` : ""}`));
}

export function useLiveRoomOccupancyQuery(
  branchId: string,
  params?: { date?: string; from?: string; to?: string },
  options?: { refetchInterval?: number }
) {
  return useQuery({
    queryKey: hospitalityKeys.liveOccupancy(branchId, params),
    queryFn: () => getLiveRoomOccupancy(branchId, params),
    enabled: Boolean(branchId),
    refetchInterval: options?.refetchInterval ?? 10_000,
    placeholderData: keepPreviousData,
  });
}

// ─── Ops boards ──────────────────────────────────────────────────────────────

export function useServicesBoardQuery(branchId: string, date: string) {
  return useQuery({
    queryKey: [...hospitalityKeys.all, "ops-services", branchId, date] as const,
    queryFn: () =>
      getRequest<ServicesBoard>(
        apiPath(`ops-board/services?branchId=${encodeURIComponent(branchId)}&date=${encodeURIComponent(date)}`)
      ),
    enabled: Boolean(branchId && date),
    refetchInterval: 15_000,
    placeholderData: keepPreviousData,
  });
}

export function useGuestsBoardQuery(branchId: string, date: string) {
  return useQuery({
    queryKey: [...hospitalityKeys.all, "ops-guests", branchId, date] as const,
    queryFn: () =>
      getRequest<GuestsBoard>(
        apiPath(`ops-board/guests?branchId=${encodeURIComponent(branchId)}&date=${encodeURIComponent(date)}`)
      ),
    enabled: Boolean(branchId && date),
    refetchInterval: 15_000,
    placeholderData: keepPreviousData,
  });
}

// ─── Front-desk actions ──────────────────────────────────────────────────────

/** Every ops board reads the same orders, so any change refreshes them all. */
function useInvalidateHospitality() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: hospitalityKeys.all });
}

export function useRecordPaymentMutation() {
  const invalidate = useInvalidateHospitality();
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: {
      orderId: string;
      amountThb: number;
      method: PaymentMethod;
      reference?: string;
    }) => postRequest<OrderResponse, typeof body>(apiPath(`orders/${orderId}/payments`), body),
    onSuccess: invalidate,
  });
}

export function useUpdateFlightMutation() {
  const invalidate = useInvalidateHospitality();
  return useMutation({
    mutationFn: ({
      orderId,
      lineId,
      ...body
    }: {
      orderId: string;
      lineId: string;
      number: string;
      landingAt: string;
      meetingDoor?: number;
    }) =>
      patchRequest<OrderResponse, typeof body>(apiPath(`orders/${orderId}/lines/${lineId}/flight`), body),
    onSuccess: invalidate,
  });
}
