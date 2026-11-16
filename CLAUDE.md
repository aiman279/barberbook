# BarberBook — Project Instructions

Root workspace rules in the parent CLAUDE.md also apply. This file adds project-specific context only.

## Overview
Online booking demo for barbershops. Customers pick a service, barber and free time slot; the shop manages bookings and services in an admin dashboard (`/admin`).

**Demo status:** all data lives in the visitor's browser (`localStorage`). There is no backend, and the admin passcode is checked client-side and protects nothing. Do not describe it as secure or production-ready.

## Stack
React 19, TypeScript ~5.8, Vite 7, Tailwind CSS 4 (`@tailwindcss/vite`), React Router 7, lucide-react. ESLint 9 with typescript-eslint. npm (`package-lock.json`).

## Commands
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: `tsc -b` then `vite build` (this is the type check)
- `npm run lint`: ESLint
- `npm run preview`: serve the production build
- There is no test runner. Verify changes with `npm run build` and `npm run lint`, and say so when reporting.

## Structure
- `src/lib/store.ts`: `Store` interface and browser-only `LocalStore`
- `src/lib/slots.ts`: availability logic (no double-booking, multi-slot services)
- `src/lib/config.ts`: shop details, opening hours, closed days, demo passcode
- `src/lib/format.ts`: date, time, price, phone helpers
- `src/lib/types.ts`, `useShopData.ts`: shared types and data hook
- `src/pages/`: Home, Book (4-step flow), Admin
- `src/components/Layout.tsx`: header and footer

## Conventions
- Screens talk only to the `Store` interface. A real backend means a new class implementing `Store`, not changes in the pages.
- Shop settings (hours, closed days, booking window) belong in `config.ts`, not hardcoded in components.
- Keep slot logic in `slots.ts`; do not duplicate it in pages.
- Follow the existing code style; do not add dependencies without approval.

## Deployment
Vercel. `vercel.json` rewrites all routes to `/index.html` (SPA). Production URL: https://barberbook-omega-nine.vercel.app. Deploy only when the owner explicitly asks; that request counts as approval (`vercel deploy --prod`).

## Repository
Own Git repo, remote `origin` on GitHub. No `.env` files exist; there are no secrets to handle at present. Never commit credentials if a backend is added.

## Production gaps (known, not bugs)
Real database, real admin authentication enforced server-side, server-side double-booking protection, customer messaging, and a privacy policy. See README "Taking it to production".
