# BarberBook

An online booking system for barbershops. Customers pick a service, a barber and a free time slot. The shop manages bookings and services from an admin dashboard.

**This is a demo.** All data is saved in the visitor's browser (`localStorage`), so nothing is shared between devices and nothing is sent to a server. The admin passcode is checked in the browser and protects nothing. See "Taking it to production" below.

## Features

**Customer**
- Four-step booking: service, barber (or "any available"), date and time, details.
- Time slots come from real availability: a barber cannot be double-booked, and a 45-minute service blocks every start time it overlaps.
- Opening hours, closed days, and a 14-day booking window are set in one config file.
- Booking code (for example `BB-7K3Q`) shown after confirming.

**Admin** (`/admin`, demo passcode shown on the page)
- Today's bookings, bookings waiting for confirmation, and expected income.
- Confirm, complete or cancel a booking, and open the customer on WhatsApp.
- Add, edit and delete services (name, price, duration).
- Reset the demo data.

## Tech

React 19, TypeScript, Vite, Tailwind CSS 4, React Router.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
npm run lint
```

## How it is organised

```
src/
  lib/
    store.ts     Data layer: a Store interface and the browser-only demo store
    slots.ts     Availability: which start times are free for a service and barber
    config.ts    Shop details, opening hours, closed days, demo passcode
    format.ts    Date, time, price and phone helpers
  pages/         Home, Book (booking flow), Admin (login and dashboard)
  components/    Layout (header and footer)
```

The screens only talk to the `Store` interface. To move to a real backend, write another class that implements `Store` and export it instead of `LocalStore`.

## Taking it to production

What a real shop would need, and what this demo does not do:

1. **A real database.** Implement `Store` on Firebase (Firestore) or any API, so bookings are shared between the customer's phone and the shop's dashboard.
2. **Real admin sign-in.** Replace the demo passcode with proper authentication, and enforce access on the server (for example Firestore security rules), not in the browser.
3. **Server-side double-booking protection.** The slot check runs in the browser. With a shared database, the same check must run in a transaction on the server.
4. **Customer messages.** Confirmation by WhatsApp or SMS needs a messaging provider.
5. **Privacy.** Names and phone numbers are personal data. A real deployment needs a retention policy and a privacy notice.
