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
  logoUrl?: string;
  heroImageUrl?: string;
  images?: string[];
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
  coverImage?: string;
  images?: string[];
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
export type PricingModel = "PER_PAX" | "PER_VEHICLE" | "PER_TREATMENT";
export type ServiceCategory = "TOURS" | "TRANSPORT" | "WELLNESS";

export type ServiceItem = {
  _id: string;
  branchId: string;
  code: string;
  category: string;
  kind: ServiceKind;
  name: string;
  description?: string;
  basePriceThb: number;
  pricingModel: string;
  coverImage?: string;
  images?: string[];
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

export type RestaurantTable = {
  tableCode: string;
  seats: number;
  minSeats?: number;
  zone: string;
  isHighTop?: boolean;
  isActive?: boolean;
};

export type RestaurantShift = {
  code: string;
  name?: string;
  label?: string;
  startTime?: string;
  endTime?: string;
  startsAt?: string;
  endsAt?: string;
};

export type RestaurantItem = {
  _id: string;
  branchId: string;
  code: string;
  name: string;
  cuisine: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  maxSeats?: number;
  totalSeats?: number;
  avgTurnMinutes?: number;
  tables?: RestaurantTable[];
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

export type HoldStay = {
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  qty?: number;
};

export type CreateHoldBody = {
  branchId: string;
  cartId: string;
  /** Either explicit slot lines or stays the server expands into room-night slots. */
  lines?: HoldLine[];
  stays?: HoldStay[];
  /** Transfers, tours and treatments; capacity is held per pickup hour, departure or start time. */
  services?: { serviceId: string; startsAt: string; pax: number }[];
  ttlMinutes?: number;
};

export type HoldResult = {
  _id: string;
  branchId: string;
  cartId: string;
  status: "ACTIVE" | "EXPIRED" | "CONVERTED" | "RELEASED";
  expiresAt: string;
  holdToken?: string;
};

export type DispatchTaskType = "HOUSEKEEPING_TURNAROUND" | "TOUR_CONSOLIDATION" | "AIRPORT_PICKUP";
/** ACKNOWLEDGED is retired server-side and never returned; kept so old cached rows still type-check. */
export type DispatchStatus = "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "DONE" | "DISMISSED";
export type TourDecision = "KEEP" | "MERGE" | "CANCEL";

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
  completedAt?: string;
  assigneeUserId?: string;
  assigneeName?: string;
  /** turnarounds only: the room's live cleaning status, which drives the task */
  cleaningStatus?: RoomCleaningStatus;
  pickup?: {
    orderId: string;
    lineId: string;
    guestName: string;
    flightNumber: string;
    etaAt: string;
    meetingDoor?: number;
    vehiclePlate?: string;
    driverUserId?: string;
    channel: string;
    deliveryStatus: string;
    card?: {
      en: string;
      th: string;
    };
    stage?: PickupStage;
    steps?: PickupStep[];
    issue?: PickupIssue;
  };
  housekeeping?: {
    roomId: string;
    roomNumber: string;
    orderId?: string;
    guestName?: string;
    etaAt: string;
    etaSource: "TRANSFER_FLIGHT" | "CHECKIN_TIME";
    flightNumber?: string;
    isVip?: boolean;
    targetReadyBy: string;
  };
  consolidation?: {
    slotKey: string;
    serviceName: string;
    departsAt: string;
    booked: number;
    capacity: number;
    fillRate: number;
    minViablePax: number;
    fixedCostThb: number;
    revenueThb: number;
    projectedLossThb: number;
    recommendation: "WATCH" | "MERGE_OR_CANCEL";
    decision?: TourDecision;
    decisionNote?: string;
  };
};

/** An airport pickup as the driver reports it, step by step. */
export type PickupStage = "ASSIGNED" | "CONFIRMED" | "EN_ROUTE" | "AT_AIRPORT" | "GUEST_ON_BOARD" | "DROPPED_OFF";

export type PickupStep = { stage: PickupStage; at: string; byName?: string; note?: string };

export type PickupIssueKind = "FLIGHT_DELAYED" | "GUEST_NOT_FOUND" | "VEHICLE_PROBLEM" | "OTHER";

export type PickupIssue = {
  kind: PickupIssueKind;
  note?: string;
  at: string;
  byName?: string;
  resolvedAt?: string;
  resolution?: "KEEP_WAITING" | "NO_SHOW" | "CONTINUED";
  resolutionNote?: string;
  resolvedByName?: string;
};

export type PickupStepResult = { dispatchId: string; status: DispatchStatus; stage?: PickupStage; notified?: string[] };

/** What a room move did: where the room is now, who holds its job, who was told. */
export type RoomTransitionResult = {
  roomId: string;
  roomNumber: string;
  cleaningStatus: RoomCleaningStatus;
  isNoOp: boolean;
  dispatchId?: string;
  assigneeName?: string;
  notified?: string[];
};

export type AssignTaskResult = DispatchTask & { notified?: string[] };

export type RosterMember = {
  id: string;
  name: string;
  role: string;
  jobTitle?: string;
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

export type OccupancyStatus = "OCCUPIED" | "ARRIVING_TODAY" | "DEPARTING_TODAY" | "VACANT";

export type OrderCharges = {
  lines: {
    lineId: string;
    kind: "STAY" | "SERVICE" | "DINING";
    label: string;
    detail: string;
    /** before service charge and VAT */
    amountThb: number;
    status?: string;
  }[];
  roomsThb: number;
  servicesThb: number;
  diningThb: number;
  subtotalThb: number;
  discountThb: number;
  serviceChargeRate: number;
  serviceChargeThb: number;
  vatRate: number;
  vatThb: number;
  totalThb: number;
  paidThb: number;
  dueThb: number;
  paymentMethod: string;
  paymentStatus: string;
  payments: {
    amountThb: number;
    method: PaymentMethod;
    reference?: string;
    receivedAt: string;
    receivedByName?: string;
  }[];
};

export type PaymentMethod = "CASH" | "CARD" | "PROMPTPAY" | "BANK_TRANSFER";

/** One transfer, tour or treatment on a live order. */
export type LiveService = {
  orderId: string;
  orderNumber: string;
  lineId: string;
  guestName: string;
  roomNumber?: string;
  serviceId: string;
  serviceKind: ServiceKind;
  serviceName: string;
  date: string;
  /** HH:mm in hotel time */
  time: string;
  startsAt: string;
  pax: number;
  /** Line revenue before service charge and VAT. */
  totalThb: number;
  status: string;
  paymentStatus: string;
  flightNumber?: string;
  meetingDoor?: number;
  /** Transfer booked without flight details: no pickup can be scheduled yet. */
  needsDetails: boolean;
  dispatch?: {
    dispatchId: string;
    status: DispatchStatus;
    stage?: PickupStage;
    hasIssue?: boolean;
    driverName?: string;
    vehiclePlate?: string;
  };
};

/** One stay line of a live order, as used by room cards, arrivals, the timeline and the booking feed. */
export type LiveStay = {
  orderId: string;
  orderNumber: string;
  lineId: string;
  roomId?: string;
  roomNumber?: string;
  roomType: RoomType;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  vipTier: "PLATINUM" | "GOLD" | "SILVER" | "NONE";
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pax: number;
  /** Room revenue for this stay line, before service charge and VAT. */
  totalThb: number;
  /** Whole order: extras, service charge and VAT included. */
  orderTotalThb: number;
  balanceDueThb: number;
  paymentStatus: "UNPAID" | "DEPOSIT" | "PAID" | "REFUNDED";
  channel: string;
  source?: string;
  flightNumber?: string;
  flightEta?: string;
  meetingDoor?: number;
  bookedAt: string;
  extras: LiveService[];
  charges: OrderCharges;
};

export type ActiveRoomDispatch = {
  dispatchId: string;
  severity: string;
  status: string;
  title: string;
  targetReadyBy?: string;
  assigneeName?: string;
};

export type LiveRoomItem = {
  _id: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  baseRateThb: number;
  maxOccupancy: number;
  cleaningStatus: RoomCleaningStatus;
  cleaningUpdatedAt?: string;
  occupancyStatus: OccupancyStatus;
  currentStay?: LiveStay;
  departingStay?: LiveStay;
  nextStay?: LiveStay;
  activeDispatch?: ActiveRoomDispatch;
  /** Only when a guest arrives on the date: their ETA and the inspect-by deadline. */
  arrival?: {
    etaAt: string;
    readyBy: string;
    etaSource: "TRANSFER_FLIGHT" | "CHECKIN_TIME";
    flightNumber?: string;
  };
};

export type RoomOccupancySummary = {
  totalRooms: number;
  occupiedTonight: number;
  occupancyRate: number;
  arrivalsToday: number;
  departuresToday: number;
  dirty: number;
  inProgress: number;
  clean: number;
  inspected: number;
  unassigned: number;
  bookedToday: number;
  bookedTodayThb: number;
  servicesToday: number;
  servicesTodayThb: number;
  pickupsToday: number;
  servicesNeedingDetails: number;
};

export type LiveOccupancyResponse = {
  branchId: string;
  branchName: string;
  timezone: string;
  date: string;
  generatedAt: string;
  summary: RoomOccupancySummary;
  rooms: LiveRoomItem[];
  stays: LiveStay[];
  arrivals: LiveStay[];
  departures: LiveStay[];
  services: LiveService[];
  recentBookings: LiveStay[];
  dateRange: {
    from: string;
    to: string;
  };
};

// ─── Ops boards ──────────────────────────────────────────────────────────────

export type SlotBooking = {
  orderId: string;
  orderNumber: string;
  lineId: string;
  guestName: string;
  roomNumber?: string;
  pax: number;
  amountThb: number;
  paymentStatus: string;
  flightNumber?: string;
  flightTime?: string;
};

export type ServiceSlotView = {
  startsAt: string;
  time: string;
  capacity: number;
  booked: number;
  held: number;
  available: number;
  fillRate: number;
  minViablePax?: number;
  belowMinimum: boolean;
  fixedCostThb: number;
  revenueThb: number;
  marginThb: number;
  bookings: SlotBooking[];
};

export type ServiceDayView = {
  date: string;
  /** null for transfers, which run on demand rather than fixed departures */
  offered: number | null;
  sold: number;
  utilization: number | null;
};

export type ServiceBoardItem = {
  serviceId: string;
  kind: ServiceKind;
  name: string;
  priceThb: number;
  pricingModel: string;
  unit: "seat" | "treatment" | "pickup";
  capacityPerSlot: number;
  slots: ServiceSlotView[];
  today: ServiceDayView & { revenueThb: number; fixedCostThb: number; marginThb: number };
  week: ServiceDayView[];
};

export type ServicesBoard = {
  date: string;
  timezone: string;
  days: string[];
  summary: {
    revenueThb: number;
    fixedCostThb: number;
    marginThb: number;
    seatsOffered: number;
    seatsSold: number;
    utilization: number;
    unsoldSeats: number;
    belowMinimum: number;
    projectedLossThb: number;
    pickups: number;
    fleetSize: number;
  };
  services: ServiceBoardItem[];
};

export type GuestStatus = "ARRIVING" | "IN_HOUSE" | "DEPARTING" | "UPCOMING";

export type GuestView = {
  guestId: string;
  name: string;
  email?: string;
  phone?: string;
  lineUserId?: string;
  language: string;
  nationality?: string;
  vipTier: string;
  vipScore: number;
  stayCount: number;
  lifetimeSpendThb: number;
  isReturning: boolean;
  status: GuestStatus;
  nextDate: string;
  stays: {
    orderId: string;
    orderNumber: string;
    roomNumber?: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    pax: number;
  }[];
  services: {
    orderId: string;
    lineId: string;
    name: string;
    kind: ServiceKind;
    date: string;
    time: string;
    pax: number;
    amountThb: number;
    flightNumber?: string;
  }[];
  folios: { orderId: string; orderNumber: string; charges: OrderCharges }[];
  dueThb: number;
};

export type GuestsBoard = {
  date: string;
  timezone: string;
  summary: {
    inHouse: number;
    arriving: number;
    departing: number;
    upcoming: number;
    vipInHouse: number;
    returning: number;
    outstandingThb: number;
  };
  guests: GuestView[];
};
