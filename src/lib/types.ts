export type Service = {
  id: string;
  name: string;
  description: string;
  /** Price in RM */
  price: number;
  /** Duration in minutes */
  duration: number;
};

export type Barber = {
  id: string;
  name: string;
  role: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  /** Short code the customer can quote, for example BB-7K3Q */
  code: string;
  serviceId: string;
  barberId: string;
  /** Local date, YYYY-MM-DD */
  date: string;
  /** Local start time, HH:MM (24 hour) */
  time: string;
  customerName: string;
  phone: string;
  status: BookingStatus;
  createdAt: string;
};

export type NewBooking = Omit<Booking, "id" | "code" | "status" | "createdAt">;
