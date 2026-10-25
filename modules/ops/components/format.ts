export const formatThb = (n: number) =>
  `฿${Math.round(n).toLocaleString("en-US")}`;

/** "24 Oct" from a YYYY-MM-DD business date, without timezone drift. */
export const shortDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export const weekday = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

export const timeAgo = (iso: string, now = Date.now()) => {
  const mins = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs} h ago` : `${Math.round(hrs / 24)} d ago`;
};

/** Today's business date in a branch timezone. */
export const businessDate = (timeZone = "Asia/Bangkok", offsetDays = 0) =>
  new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(Date.now() + offsetDays * 86_400_000));
