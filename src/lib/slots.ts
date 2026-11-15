import {
  BOOKING_WINDOW_DAYS,
  CLOSED_WEEKDAYS,
  CLOSE_MIN,
  OPEN_MIN,
  STEP_MIN,
} from "./config";
import {
  addDays,
  fromDateKey,
  minutesToTime,
  timeToMinutes,
  toDateKey,
} from "./format";
import type { Barber, Booking, Service } from "./types";

export type Slot = { time: string; barberId: string };

export function isClosedOn(dateKey: string): boolean {
  return CLOSED_WEEKDAYS.includes(fromDateKey(dateKey).getDay());
}

/** The next BOOKING_WINDOW_DAYS days, starting today */
export function bookableDates(today = new Date()): string[] {
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) =>
    toDateKey(addDays(today, i)),
  );
}

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}

/** True if the barber has no active booking that overlaps the given window */
export function isBarberFree(
  barberId: string,
  dateKey: string,
  start: number,
  end: number,
  bookings: Booking[],
  services: Service[],
): boolean {
  return !bookings.some((b) => {
    if (b.barberId !== barberId || b.date !== dateKey) return false;
    if (b.status === "cancelled") return false;
    const svc = services.find((s) => s.id === b.serviceId);
    const bStart = timeToMinutes(b.time);
    const bEnd = bStart + (svc?.duration ?? STEP_MIN);
    return overlaps(start, end, bStart, bEnd);
  });
}

/**
 * Available start times for a service on a date.
 * With barberId "any", a time is listed when at least one barber is free,
 * and the slot carries the first free barber.
 */
export function getAvailableSlots(args: {
  dateKey: string;
  service: Service;
  barberId: string | "any";
  barbers: Barber[];
  bookings: Booking[];
  services: Service[];
  now?: Date;
}): Slot[] {
  const { dateKey, service, barberId, barbers, bookings, services } = args;
  const now = args.now ?? new Date();

  if (isClosedOn(dateKey)) return [];

  const isToday = dateKey === toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const candidates = barberId === "any" ? barbers : barbers.filter((b) => b.id === barberId);

  const slots: Slot[] = [];
  for (let start = OPEN_MIN; start + service.duration <= CLOSE_MIN; start += STEP_MIN) {
    if (isToday && start <= nowMin) continue;
    const end = start + service.duration;
    const free = candidates.find((b) =>
      isBarberFree(b.id, dateKey, start, end, bookings, services),
    );
    if (free) slots.push({ time: minutesToTime(start), barberId: free.id });
  }
  return slots;
}
