/**
 * Generates the HYPOTHETICAL sample data used by the Yoonie demo.
 *
 * "Sam's Garden House" is a fictional 20-room boutique hotel in Chiang Mai. Nothing here is
 * real customer data. The files are deliberately messy, the way an inherited owner
 * spreadsheet tends to be:
 *   - one sheet per year, with column names that change between years
 *   - dates in three formats, amounts typed as text ("฿1,850")
 *   - duplicate rows, missing amounts, a typo'd rate, a reversed stay, cancelled rows
 *   - channel names spelled five different ways
 *   - expense categories named inconsistently, a duplicate bill, a refund, a missing amount
 *   - reviews on a 10-point scale (Booking.com) mixed with 5-point (Google)
 *
 * Built-in story (so the pipeline has something real to find):
 *   - July baseline (2024–2025) ≈ 70% occupancy; July 2026 ≈ 56% (a 20% relative drop),
 *     concentrated on weekdays
 *   - utilities up sharply from May 2026, plus an unusual August 2026 electricity bill
 *   - bathroom & cleanliness complaints rise from May 2026; ratings slip
 *
 * Run: node scripts/generate-demo-data.mjs   → writes public/demo/*
 */
import * as XLSX from "xlsx";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/demo/", import.meta.url);
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------ seeded RNG */
let seed = 20260714;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const between = (a, b) => a + rand() * (b - a);

/* ------------------------------------------------------------- calendar */
const START = Date.UTC(2024, 0, 1);
const END = Date.UTC(2026, 9, 31); // last stay night: 31 Oct 2026
const DAY = 86400000;
const parts = (t) => {
  const d = new Date(t);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), dow: d.getUTCDay() };
};
const isWeekendNight = (dow) => dow === 5 || dow === 6;

const ROOMS = [...Array(10)].map((_, i) => `${101 + i}`).concat([...Array(10)].map((_, i) => `${201 + i}`));

// target occupancy by calendar month (Chiang Mai: cool high season Nov–Feb, green season May–Sep)
const SEASON = { 1: 0.86, 2: 0.84, 3: 0.72, 4: 0.7, 5: 0.6, 6: 0.62, 7: 0.7, 8: 0.68, 9: 0.58, 10: 0.66, 11: 0.82, 12: 0.88 };
const yearNoise = { 2023: {}, 2024: {}, 2025: {}, 2026: {} };
for (const y of [2023, 2024, 2025, 2026]) for (let m = 1; m <= 12; m++) yearNoise[y][m] = between(-0.02, 0.02);

function target(t) {
  const { y, m, dow } = parts(t);
  const wknd = isWeekendNight(dow);
  if (y === 2026 && m === 7) return wknd ? 0.75 : 0.47; // the July 2026 weekday slump
  if (m === 7) return wknd ? 0.78 : 0.64;
  const base = SEASON[m] + yearNoise[y][m];
  return Math.min(0.97, wknd ? base + 0.1 : base - 0.04);
}

function nightlyRate(t, room) {
  const { y, m, dow } = parts(t);
  const base = [11, 12, 1, 2].includes(m) ? 2400 : [3, 4, 10].includes(m) ? 1950 : 1700;
  const typeMult = room.startsWith("2") ? 1.25 : 1;
  const weekend = isWeekendNight(dow) ? 1.12 : 1;
  const yearly = 1 + 0.04 * (y - 2024);
  return base * typeMult * weekend * yearly;
}

/* -------------------------------------------------------------- guests */
const FIRST = ["Anna", "Ben", "Chloe", "Daniel", "Emma", "Felix", "Grace", "Hiro", "Isabel", "Jonas", "Kanya", "Liam", "Mai", "Niran", "Olivia", "Pim", "Quentin", "Rina", "Somchai", "Tom", "Uma", "Victor", "Wan", "Yuki", "Zoe", "Arthit", "Mei", "Lars", "Sofia", "Kenji"];
const LAST = ["Smith", "Müller", "Tanaka", "Srisuk", "Nguyen", "Brown", "Kim", "Rossi", "Chen", "Dubois", "Wong", "Jensen", "Garcia", "Sato", "Boonmee", "Taylor", "Novak", "Lee", "Patel", "Walker"];
const CHANNELS = [
  ["Booking.com", 0.36, ["Booking.com", "booking", "BDC", "Booking"]],
  ["Agoda", 0.3, ["Agoda", "agoda.com", "AGODA"]],
  ["Direct", 0.21, ["Walk-in", "Direct", "LINE", "Phone", "Website"]],
  ["Expedia", 0.08, ["Expedia", "expedia"]],
  ["Trip.com", 0.05, ["Trip.com", "Ctrip"]],
];
function channel() {
  let u = rand();
  for (const c of CHANNELS) {
    if ((u -= c[1]) <= 0) return c;
  }
  return CHANNELS[0];
}

/* ------------------------------------------------------------ bookings */
const bookings = [];
const MEAN_LOS = 2.3;
for (const room of ROOMS) {
  let t = START - 2 * DAY;
  while (t <= END) {
    const p = target(t);
    const startProb = p / (MEAN_LOS * (1 - p) + p);
    if (rand() < startProb) {
      const nights = pick([1, 1, 2, 2, 2, 3, 3, 4, 5]);
      let amount = 0;
      for (let i = 0; i < nights; i++) amount += nightlyRate(t + i * DAY, room);
      const [chan, , spellings] = channel();
      if (t + DAY > START)
        bookings.push({
          room,
          checkIn: t,
          checkOut: t + nights * DAY,
          nights,
          amount: Math.round(amount / 10) * 10,
          channel: chan,
          channelText: pick(spellings),
          guest: `${pick(FIRST)} ${pick(LAST)}`,
          status: pick(["Confirmed", "Checked out", "Checked out", ""]),
        });
      t += nights * DAY;
    } else t += DAY;
  }
}

/**
 * Random stays are noisy, so pin each July to its story value exactly:
 * remove whole stays (weekday arrivals first for 2026) or add one-night stays on free room-days.
 */
function calibrate(y, m, goal, weekdaysOnly) {
  const from = Date.UTC(y, m - 1, 1);
  const to = Date.UTC(y, m, 1);
  const days = (to - from) / DAY;
  const avail = ROOMS.length * days;
  let cur = occ(y, m);
  const removable = bookings.filter(
    (b) => b.checkIn >= from && b.checkOut <= to && (!weekdaysOnly || !isWeekendNight(parts(b.checkIn).dow))
  );
  while (cur > goal + 0.001 && removable.length) {
    const b = removable.splice(Math.floor(rand() * removable.length), 1)[0];
    if (cur - b.nights / avail < goal - 0.004) continue;
    bookings.splice(bookings.indexOf(b), 1);
    cur -= b.nights / avail;
  }
  let guard = 0;
  while (cur < goal - 0.001 && guard++ < 10000) {
    const room = pick(ROOMS);
    const t = from + Math.floor(rand() * days) * DAY;
    if (weekdaysOnly && isWeekendNight(parts(t).dow)) continue;
    if (bookings.some((b) => b.room === room && b.checkIn <= t && t < b.checkOut)) continue;
    const [chan, , spellings] = channel();
    bookings.push({
      room, checkIn: t, checkOut: t + DAY, nights: 1,
      amount: Math.round(nightlyRate(t, room) / 10) * 10,
      channel: chan, channelText: pick(spellings), guest: `${pick(FIRST)} ${pick(LAST)}`, status: "Checked out",
    });
    cur += 1 / avail;
  }
}
calibrate(2024, 7, 0.705, false);
calibrate(2025, 7, 0.695, false);
calibrate(2026, 7, 0.56, true);

bookings.sort((a, b) => a.checkIn - b.checkIn || a.room.localeCompare(b.room));
bookings.forEach((b, i) => (b.ref = `GH-${new Date(b.checkIn).getUTCFullYear() % 100}-${String(i + 1).padStart(4, "0")}`));

// cancellations: extra rows that never occupied a room
const cancelled = [];
for (const b of bookings) if (rand() < 0.03) cancelled.push({ ...b, ref: b.ref + "C", room: pick(ROOMS), guest: `${pick(FIRST)} ${pick(LAST)}`, status: "Cancelled" });

// occupancy check for the story
function occ(y, m) {
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  let nights = 0;
  const from = Date.UTC(y, m - 1, 1);
  const to = Date.UTC(y, m, 1);
  for (const b of bookings) for (let t = b.checkIn; t < b.checkOut; t += DAY) if (t >= from && t < to) nights++;
  return nights / (ROOMS.length * days);
}
console.log("July occupancy", [2024, 2025, 2026].map((y) => `${y}: ${(occ(y, 7) * 100).toFixed(1)}%`).join("  "));

/* -------------------------------------------------- write bookings.xlsx */
const local = (t) => {
  const { y, m, d } = parts(t);
  return new Date(y, m - 1, d); // SheetJS converts local Date → Excel serial
};
const dmy = (t) => {
  const { y, m, d } = parts(t);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longDate = (t) => {
  const { y, m, d } = parts(t);
  return `${d} ${MON[m - 1]} ${y}`;
};
const thb = (n) => `฿${n.toLocaleString("en-US")}`;

const all = [...bookings, ...cancelled].sort((a, b) => a.checkIn - b.checkIn);
const byYear = { 2024: [], 2025: [], 2026: [] };
for (const b of all) byYear[new Date(b.checkIn).getUTCFullYear()].push(b);

// pick rows to break, deterministically
const real = (y) => byYear[y].filter((b) => b.status !== "Cancelled");
const missingAmount = new Set([...real(2024).filter((_, i) => i % 331 === 17), ...real(2025).filter((_, i) => i % 401 === 50), ...real(2026).filter((_, i) => i % 360 === 99)].slice(0, 9));
const tbc = real(2026)[211];
const typo = real(2025).find((b) => b.nights === 1 && new Date(b.checkIn).getUTCMonth() === 10);
const reversed = real(2025)[640];
const noCheckout = new Set([real(2026)[30], real(2026)[455], real(2026)[702]]);
const noRoom = real(2024)[905];
const dupes = [real(2024)[120], real(2024)[777], real(2025)[300], real(2025)[1012], real(2026)[150], real(2026)[600]];

function rowsFor(year) {
  const out = [];
  for (const b of byYear[year]) {
    let amount = b.amount;
    if (missingAmount.has(b)) amount = "";
    else if (b === tbc) amount = "TBC";
    else if (b === typo) amount = b.amount * 10;
    let ci = b.checkIn;
    let co = b.checkOut;
    if (b === reversed) [ci, co] = [co, ci];
    const room = b === noRoom ? "" : b.room;

    let row;
    if (year === 2024) {
      row = [b.ref, b.guest, room, local(ci), local(co), b.nights, amount, b.channelText, b.status];
    } else {
      const fmt = (t) => (year === 2025 ? dmy(t) : rand() < 0.6 ? longDate(t) : local(t));
      const amt = typeof amount === "number" && rand() < 0.45 ? thb(amount) : amount;
      row = [b.ref, b.guest, room, fmt(ci), noCheckout.has(b) ? "" : fmt(co), b.nights, amt, b.channelText, b.status];
      if (year === 2026) row.push(pick(["", "", "", "", "late arrival", "honeymoon", "paid cash", "repeat guest", "airport pickup"]));
    }
    out.push(row);
    if (dupes.includes(b)) out.push([...row]);
  }
  return out;
}

const wbB = XLSX.utils.book_new();
const H24 = ["Booking Ref", "Guest Name", "Room", "Check In", "Check Out", "Nights", "Amount (THB)", "Channel", "Status"];
const H25 = ["Ref", "Guest", "Room No", "Arrival", "Departure", "Nts", "Total", "Source", "Status"];
const sheet24 = XLSX.utils.aoa_to_sheet([H24, ...rowsFor(2024)], { cellDates: true, dateNF: "dd/mm/yyyy" });
XLSX.utils.book_append_sheet(wbB, sheet24, "2024");
XLSX.utils.book_append_sheet(wbB, XLSX.utils.aoa_to_sheet([H25, ...rowsFor(2025)], { cellDates: true, dateNF: "dd/mm/yyyy" }), "2025");
XLSX.utils.book_append_sheet(wbB, XLSX.utils.aoa_to_sheet([[...H25, "Notes"], ...rowsFor(2026)], { cellDates: true, dateNF: "d mmm yyyy" }), "2026");
// the parents' old summary tab: not a data table
XLSX.utils.book_append_sheet(
  wbB,
  XLSX.utils.aoa_to_sheet([
    ["Sam's Garden House — monthly summary (old)"],
    [],
    ["Month", "Rooms sold", "Money in", "Notes from Mum"],
    ["Jan", 520, "฿1.2m", "busy, hire extra help"],
    ["Feb", 470, "฿1.1m", ""],
    ["Mar", 445, "", "fix roof before rain"],
  ]),
  "Summary"
);
writeFileSync(new URL("Sams-Garden-House-bookings-2024-2026.xlsx", OUT), XLSX.write(wbB, { type: "buffer", bookType: "xlsx", compression: true }));

/* --------------------------------------------------------- expenses.csv */
function monthStats(y, m) {
  const from = Date.UTC(y, m - 1, 1);
  const to = Date.UTC(y, m, 1);
  let nights = 0;
  let ota = 0;
  for (const b of bookings) {
    const per = b.amount / b.nights;
    for (let t = b.checkIn; t < b.checkOut; t += DAY)
      if (t >= from && t < to) {
        nights++;
        if (b.channel !== "Direct") ota += per;
      }
  }
  return { nights, ota };
}
const ELEC_BASE = { 1: 33000, 2: 34000, 3: 41000, 4: 46000, 5: 45000, 6: 42000, 7: 40000, 8: 39000, 9: 38000, 10: 37000, 11: 34000, 12: 33000 };
const exp = [["Date", "Category", "Description", "Amount"]];
const money = (n, y) => {
  const v = Math.round(n);
  if (y === 2024) return String(v);
  return rand() < 0.5 ? v.toLocaleString("en-US") : `฿ ${v.toLocaleString("en-US")}.00`;
};
const expDate = (y, m, d) => (y === 2024 ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : `${d}/${m}/${y}`);

for (let y = 2024; y <= 2026; y++)
  for (let m = 1; m <= 12; m++) {
    if (y === 2026 && m > 10) break;
    const { nights, ota } = monthStats(y, m);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const add = (d, cat, desc, amt) => exp.push([expDate(y, m, d), cat, desc, amt === null ? "" : money(amt, y)]);

    add(25, "Salaries", "Staff salaries (14)", { 2024: 262000, 2025: 272000, 2026: 280000 }[y]);
    add(25, "Staff", "Social security", 8750);
    let elec = ELEC_BASE[m] * (y === 2025 ? 1.03 : y === 2026 ? 1.03 : 1) * between(0.97, 1.03);
    if (y === 2026 && m >= 5) elec *= 1.22;
    if (y === 2026 && m === 8) elec = 71400;
    const elecCat = pick(["Electricity", "Elec", "PEA electricity bill"]);
    add(last, elecCat, "PEA monthly bill", elec);
    if (y === 2025 && m === 3) add(last, elecCat, "PEA monthly bill", elec); // entered twice
    add(last, "Water", "PWA water", y === 2026 && m === 9 ? null : between(5200, 6800) * (y === 2026 && m >= 5 ? 1.15 : 1));
    add(last, "Internet", "Internet (3BB fibre)", 1890);
    add(28, "Laundry", "Linen & towel laundry", nights * 42);
    add(28, "Amenities", "Guest amenities & toiletries", nights * 18);
    add(15, "Food", "Breakfast ingredients", nights * 0.9 * 95);
    add(Math.ceil(between(1, last)), "Maintenance", pick(["General repairs", "Air-con service", "Plumbing", "Garden lights"]), between(4000, 15000));
    if (y === 2026 && m === 6) add(12, "Maintenance", "Shower repair room 204", 6500);
    add(last, "OTA commission", "Booking.com / Agoda / Expedia commission", ota * 0.17);
    add(5, "Marketing", "Facebook ads", 3500);
    add(1, "Garden", "Garden service", 2500);
    if (y === 2025 && m === 6) add(20, "Laundry", "Refund - laundry overcharge", -1200);
  }
writeFileSync(new URL("Sams-Garden-House-expenses.csv", OUT), exp.map((r) => r.map((c) => (/[",]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",")).join("\n"));

/* ---------------------------------------------------------- reviews.xlsx */
const POSITIVE = [
  "Lovely garden and very friendly staff.",
  "Great location, an easy walk to the Old City.",
  "Breakfast was delicious, the mango sticky rice especially.",
  "Quiet and peaceful, we would stay again.",
  "Room was spacious and comfortable.",
  "Staff helped us book a cooking class.",
  "Beautiful teak furniture and a calm atmosphere.",
  "Good value for money.",
];
const COMPLAINTS = {
  bathroom: ["Shower water pressure was weak.", "The bathroom drain smelled bad.", "Black mould on the shower silicone.", "Toilet was blocked on the second day.", "No hot water in the morning."],
  cleanliness: ["Room was not very clean when we arrived.", "Found hair in the bathroom.", "Dust under the bed and stains on the sheets.", "Towels smelled musty."],
  noise: ["Street noise at night."],
  wifi: ["Wi-Fi was slow in our room."],
  breakfast: ["Breakfast was a bit limited."],
};
const rev = [["Date", "Platform", "Rating", "Review"]];
for (let y = 2024; y <= 2026; y++)
  for (let m = 1; m <= 12; m++) {
    if (y === 2026 && m > 10) break;
    const bad = y === 2026 && m >= 5;
    const n = Math.round(between(7, 11));
    for (let i = 0; i < n; i++) {
      const day = Math.ceil(between(1, 28));
      const lines = [pick(POSITIVE)];
      let score = between(4.4, 5);
      const probs = { bathroom: bad ? 0.17 : 0.02, cleanliness: bad ? 0.11 : 0.025, noise: 0.04, wifi: 0.03, breakfast: 0.03 };
      for (const [theme, p] of Object.entries(probs))
        if (rand() < p) {
          lines.push(pick(COMPLAINTS[theme]));
          score -= theme === "bathroom" || theme === "cleanliness" ? 1.3 : 0.6;
        }
      score = Math.max(1, Math.min(5, score));
      const platform = pick(["Booking.com", "Google", "Google", "TripAdvisor", "Agoda"]);
      const rating = platform === "Booking.com" ? Math.round(score * 2 * 10) / 10 : Math.round(score);
      const date = rand() < 0.5 ? new Date(y, m - 1, day) : `${day}/${m}/${y}`;
      rev.push([date, platform, rand() < 0.02 ? "" : rating, lines.join(" ")]);
    }
  }
rev.push(["", "Google", 5, "Wonderful stay, thank you Sam!"]); // undated
const wbR = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbR, XLSX.utils.aoa_to_sheet(rev, { cellDates: true, dateNF: "dd/mm/yyyy" }), "Reviews");
writeFileSync(new URL("Sams-Garden-House-guest-reviews.xlsx", OUT), XLSX.write(wbR, { type: "buffer", bookType: "xlsx", compression: true }));

console.log(`bookings: ${bookings.length} (+${cancelled.length} cancelled), expenses: ${exp.length - 1}, reviews: ${rev.length - 1}`);
