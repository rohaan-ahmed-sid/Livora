# Livora

A mobile-first health companion app for managing glucose levels, meals, activity, and wellness trends — built with React and powered by Lovable Cloud.

## Features

- **Dashboard** — Real-time glucose gauge, predictive insights, activity summary, and quick actions
- **Meals** — Log and review meals with macro breakdowns (carbs, protein, fat) and glycemic impact tracking
- **Activity** — Track workouts, steps, and sleep with calorie burn estimates
- **History** — Browse past glucose readings, meals, and activity logs by date with a calendar picker
- **Trends** — Visualize glucose patterns and health metrics over time
- **Alerts** — Get notified about glucose highs, lows, and other health events
- **Profile** — Manage personal settings, devices, and preferences
- **Onboarding** — Guided setup for diagnosis info, lifestyle, and device connections

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Routing:** React Router v6
- **State & Data:** TanStack React Query
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Backend:** Under construction

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or Bun)

### Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── brand/          # Logo and branding
│   ├── dashboard/      # Glucose gauge, predictions, activity summary
│   ├── layout/         # AppLayout, TopBar, BottomNav
│   ├── onboarding/     # Multi-step onboarding wizard
│   └── ui/             # shadcn/ui component library
├── hooks/              # Custom React hooks (theme, mobile detection)
├── integrations/       # Lovable Cloud client and types
├── pages/              # Route-level page components
└── lib/                # Utility functions
```

## License

This project is private and not licensed for redistribution.
