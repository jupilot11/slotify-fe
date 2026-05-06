# Slotify — Smart Appointment Booking

A multi-tenant appointment booking platform for service-based businesses (barbershops, salons, clinics, etc.). Customers can book appointments 24/7 via a public-facing page; business owners manage everything through a dashboard.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Demo credentials:** `owner@slotify.com` (any password)

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod |
| State | React built-ins (no external store) |

## Project Structure

```
app/
  /                    # Landing page
  /login               # Auth page
  /dashboard           # Owner dashboard (stats, bookings, services, settings)
  /[businessSlug]      # Public booking page (e.g. /jays-barbershop)
  /admin               # Admin panel

features/              # Feature-scoped UI components
services/              # Data access layer (all mock)
components/            # Reusable UI primitives
hooks/                 # Shared React hooks
types/                 # TypeScript interfaces
mock/                  # In-memory mock data
constants/             # App-wide constants
lib/                   # Utility functions
```

## Services (Current: Mock)

All data is served from in-memory mock stores with simulated network delays. The service layer is abstracted so these can be swapped for real API calls without touching the UI.

| Service | Responsibilities |
|---|---|
| `auth.service.ts` | Login, get current user |
| `business.service.ts` | Get/update business by slug or ID |
| `catalog.service.ts` | CRUD for business services |
| `booking.service.ts` | Bookings, status updates, available time slots |

**Mock users:**

| Email | Role |
|---|---|
| `owner@slotify.com` | owner |
| `staff@slotify.com` | staff |
| `admin@slotify.com` | admin |

**Mock businesses:** Jay's Barbershop, Glow Salon, City Dental Clinic

## Data Models

`User` · `Business` · `Service` · `Booking` · `TimeSlot`

All models carry a `businessId` for multi-tenant support.

## Connecting a Real Backend

Replace the mock implementations in `services/` with real HTTP calls. No other files need to change — the service layer is the only integration boundary.
