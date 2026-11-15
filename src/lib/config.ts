export const SHOP = {
  name: "Klasik Barber",
  tagline: "Sharp cuts. Clean shaves. Zero waiting.",
  address: "12 Jalan Contoh, Kuala Lumpur",
  phone: "+60 12-000 0000",
};

/** Opening hours in minutes from midnight */
export const OPEN_MIN = 10 * 60;
export const CLOSE_MIN = 20 * 60;
/** Start times are offered every STEP minutes */
export const STEP_MIN = 30;
/** Weekdays the shop is closed. 0 = Sunday */
export const CLOSED_WEEKDAYS = [0];
/** How many days ahead a customer can book */
export const BOOKING_WINDOW_DAYS = 14;

/**
 * Demo only. This passcode is checked in the browser, so it protects nothing.
 * A real deployment would use real authentication (for example Firebase Auth).
 */
export const DEMO_ADMIN_PASSCODE = "demo1234";
