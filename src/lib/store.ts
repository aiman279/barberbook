import { CLOSED_WEEKDAYS } from "./config";
import { addDays, timeToMinutes, toDateKey } from "./format";
import { isBarberFree } from "./slots";
import type {
  Barber,
  Booking,
  BookingStatus,
  NewBooking,
  Service,
} from "./types";

/**
 * Data layer. The UI only talks to this interface, so the browser-only demo
 * store below can later be replaced by a Firebase (or any API) implementation
 * without touching the screens.
 */
export interface Store {
  listServices(): Promise<Service[]>;
  saveService(service: Service): Promise<void>;
  deleteService(id: string): Promise<void>;
  listBarbers(): Promise<Barber[]>;
  listBookings(): Promise<Booking[]>;
  createBooking(input: NewBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: BookingStatus): Promise<void>;
  resetDemoData(): Promise<void>;
}

const KEY = "barberbook:v1";

const SEED_SERVICES: Service[] = [
  {
    id: "svc-classic",
    name: "Classic Haircut",
    description: "Wash, cut and style with a hot towel finish.",
    price: 25,
    duration: 30,
  },
  {
    id: "svc-fade",
    name: "Skin Fade",
    description: "Sharp, clean fade blended to your preferred length.",
    price: 35,
    duration: 45,
  },
  {
    id: "svc-beard",
    name: "Beard Trim & Shape",
    description: "Line-up, trim and shape with a hot towel and balm.",
    price: 20,
    duration: 30,
  },
  {
    id: "svc-combo",
    name: "Cut + Beard Combo",
    description: "Our full service: haircut and beard in one visit.",
    price: 50,
    duration: 60,
  },
];

const SEED_BARBERS: Barber[] = [
  { id: "bar-adam", name: "Adam", role: "Master barber" },
  { id: "bar-haziq", name: "Haziq", role: "Fade specialist" },
  { id: "bar-irfan", name: "Irfan", role: "Beard specialist" },
];

type Data = {
  services: Service[];
  barbers: Barber[];
  bookings: Booking[];
};

function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return "BB-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function makeId(): string {
  return crypto.randomUUID();
}

function seedBookings(): Booking[] {
  // Put the examples on the next two days the shop is actually open.
  const openDays: Date[] = [];
  for (let d = new Date(); openDays.length < 2; d = addDays(d, 1)) {
    if (!CLOSED_WEEKDAYS.includes(d.getDay())) openDays.push(d);
  }
  const mk = (
    dayOffset: number,
    time: string,
    serviceId: string,
    barberId: string,
    name: string,
    phone: string,
    status: BookingStatus,
  ): Booking => ({
    id: makeId(),
    code: makeCode(),
    serviceId,
    barberId,
    date: toDateKey(openDays[dayOffset]),
    time,
    customerName: name,
    phone,
    status,
    createdAt: new Date().toISOString(),
  });
  return [
    mk(0, "14:00", "svc-fade", "bar-haziq", "Sample Customer A", "0120000001", "confirmed"),
    mk(0, "16:30", "svc-classic", "bar-adam", "Sample Customer B", "0120000002", "pending"),
    mk(1, "11:00", "svc-combo", "bar-irfan", "Sample Customer C", "0120000003", "pending"),
    mk(1, "15:00", "svc-beard", "bar-adam", "Sample Customer D", "0120000004", "confirmed"),
  ];
}

function freshData(): Data {
  return {
    services: SEED_SERVICES,
    barbers: SEED_BARBERS,
    bookings: seedBookings(),
  };
}

/** Browser-only store. Falls back to memory if localStorage is unavailable. */
class LocalStore implements Store {
  private memory: Data | null = null;

  private read(): Data {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as Data;
      const data = freshData();
      localStorage.setItem(KEY, JSON.stringify(data));
      return data;
    } catch {
      if (!this.memory) this.memory = freshData();
      return this.memory;
    }
  }

  private write(data: Data): void {
    this.memory = data;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked: the in-memory copy still works for this visit.
    }
  }

  async listServices() {
    return this.read().services;
  }

  async saveService(service: Service) {
    const data = this.read();
    const i = data.services.findIndex((s) => s.id === service.id);
    if (i >= 0) data.services[i] = service;
    else data.services.push(service);
    this.write(data);
  }

  async deleteService(id: string) {
    const data = this.read();
    const inUse = data.bookings.some(
      (b) => b.serviceId === id && b.status !== "cancelled" && b.status !== "completed",
    );
    if (inUse) throw new Error("This service has upcoming bookings. Cancel them first.");
    data.services = data.services.filter((s) => s.id !== id);
    this.write(data);
  }

  async listBarbers() {
    return this.read().barbers;
  }

  async listBookings() {
    return this.read().bookings;
  }

  async createBooking(input: NewBooking) {
    const data = this.read();
    const service = data.services.find((s) => s.id === input.serviceId);
    if (!service) throw new Error("Service not found.");
    const barber = data.barbers.find((b) => b.id === input.barberId);
    if (!barber) throw new Error("Barber not found.");

    // Check again here: another booking may have taken the slot since the page loaded.
    const start = timeToMinutes(input.time);
    const free = isBarberFree(
      input.barberId,
      input.date,
      start,
      start + service.duration,
      data.bookings,
      data.services,
    );
    if (!free) throw new Error("Sorry, that time was just taken. Please pick another slot.");

    const booking: Booking = {
      ...input,
      id: makeId(),
      code: makeCode(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    data.bookings.push(booking);
    this.write(data);
    return booking;
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const data = this.read();
    const b = data.bookings.find((x) => x.id === id);
    if (b) b.status = status;
    this.write(data);
  }

  async resetDemoData() {
    this.write(freshData());
  }
}

export const store: Store = new LocalStore();
