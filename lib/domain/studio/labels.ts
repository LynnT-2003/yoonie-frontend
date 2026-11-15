import type { ExpenseCategory, ReviewTheme } from "@/lib/types/studio";

/** Display names, safe to import from client components (no spreadsheet parser attached). */

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  staff: "Staff",
  utilities: "Utilities",
  housekeeping: "Housekeeping & laundry",
  maintenance: "Maintenance",
  commissions: "OTA commissions",
  food: "Food & breakfast",
  marketing: "Marketing",
  other: "Other",
};

export const THEME_LABEL: Record<ReviewTheme, string> = {
  cleanliness: "Cleanliness",
  bathroom: "Bathroom",
  noise: "Noise",
  staff: "Staff",
  breakfast: "Breakfast",
  wifi: "Wi-Fi",
  aircon: "Air-con",
  location: "Location",
};
