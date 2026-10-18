export type BranchSettings = {
  checkInTime: string;
  checkOutTime: string;
  vatRate: number;
  serviceChargeRate: number;
  holdTtlMinutes: number;
  consolidationThreshold: number;
  dispatchGenerationTime: string;
};

export type Branch = {
  _id: string;
  code: string;
  name: string;
  timezone: string;
  currency: string;
  address?: {
    line1?: string;
    district?: string;
    city?: string;
    countryCode?: string;
    postalCode?: string;
  };
  contactPhoneE164?: string;
  contactEmail?: string;
  settings: BranchSettings;
  isActive: boolean;
};

export type RoomCleaningStatus = "DIRTY" | "IN_PROGRESS" | "CLEAN" | "INSPECTED";
export type RoomType = "STANDARD_KING" | "DELUXE_BALCONY" | "POOL_VILLA";

export type RoomItem = {
  _id: string;
  branchId: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  maxOccupancy?: number;
  baseRateThb?: number;
  amenities: string[];
  cleaningStatus: RoomCleaningStatus;
  isActive?: boolean;
  cleaningUpdatedAt?: string;
};

export type HousekeepingBoard = {
  dirty: RoomItem[];
  inProgress: RoomItem[];
  clean: RoomItem[];
  inspected: RoomItem[];
};

export type ServiceKind = "AIRPORT_TRANSFER" | "SCHEDULED_TOUR" | "SPA_TREATMENT";

export type ServiceItem = {
  _id: string;
  branchId: string;
  code: string;
  category: string;
  kind: ServiceKind;
  name: string;
  basePriceThb: number;
  pricingModel: string;
  tour?: {
    capacity: number;
    minViablePax: number;
    fixedCostThb: number;
    departureTimes: string[];
    durationMin: number;
    meetingPoint: string;
  };
  transfer?: {
    airportCode: string;
    airportName: string;
    vehicles: Array<{
      plate: string;
      type: string;
      capacityPax: number;
    }>;
  };
  wellness?: {
    durationMin: number;
    startTimes: string[];
  };
};

export type RestaurantShift = {
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
};

export type RestaurantItem = {
  _id: string;
  branchId: string;
  code: string;
  name: string;
  cuisine: string;
  shifts: RestaurantShift[];
};

export type AvailabilityResult = {
  available: number;
  branchId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
};

export type HoldLine = {
  slotKey: string;
  qty: number;
};

export type CreateHoldBody = {
  branchId: string;
  cartId: string;
  lines: HoldLine[];
  ttlMinutes?: number;
};

export type HoldResult = {
  _id: string;
  branchId: string;
  cartId: string;
  status: "ACTIVE" | "EXPIRED" | "CONVERTED" | "RELEASED";
  expiresAt: string;
};

export type DispatchTaskType = "HOUSEKEEPING_TURNAROUND" | "TOUR_CONSOLIDATION" | "AIRPORT_PICKUP";
export type DispatchStatus = "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "DONE" | "DISMISSED";

export type DispatchTask = {
  _id: string;
  branchId: string;
  serviceDate: string;
  type: DispatchTaskType;
  priorityScore: number;
  severity: "INFO" | "WARN" | "CRITICAL";
  status: DispatchStatus;
  title: string;
  dueAt?: string;
  pickup?: {
    guestName: string;
    flightNumber: string;
    etaAt: string;
    meetingDoor: number;
    vehiclePlate: string;
    channel: string;
    deliveryStatus: string;
    card?: {
      en: string;
      th: string;
    };
  };
  housekeeping?: {
    roomId: string;
    roomNumber: string;
    guestName?: string;
    etaAt?: string;
    isVip?: boolean;
    targetReadyBy?: string;
  };
  consolidation?: {
    serviceName: string;
    departsAt: string;
    booked: number;
    capacity: number;
    minViablePax: number;
    projectedLossThb: number;
    recommendation: "OK" | "WATCH" | "MERGE_OR_CANCEL";
  };
};

export type OrderTotals = {
  subtotalThb: number;
  discountThb: number;
  serviceChargeRate: number;
  serviceChargeThb: number;
  vatRate: number;
  vatThb: number;
  grandTotalThb: number;
};

export type OrderResponse = {
  _id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totals: OrderTotals;
  payment: {
    status: "UNPAID" | "PAID";
    paidThb: number;
  };
};
