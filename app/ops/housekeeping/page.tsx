import { redirect } from "next/navigation";

/** Housekeeping work lives in Dispatch now; keep old links and bookmarks working. */
export default function HousekeepingPage() {
  redirect("/ops/dispatch?lane=rooms");
}
