export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local date as YYYY-MM-DD (not UTC, so it matches what the customer sees) */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

/** 14:30 -> 2:30 PM */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export function formatDate(key: string, opts?: Intl.DateTimeFormatOptions): string {
  return fromDateKey(key).toLocaleDateString("en-MY", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...opts,
  });
}

export function formatPrice(price: number): string {
  return `RM ${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

/** Keep digits and a leading +, for storing and for validation */
export function normalisePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

export function isValidPhone(raw: string): boolean {
  const digits = normalisePhone(raw).replace("+", "");
  return digits.length >= 9 && digits.length <= 13;
}
