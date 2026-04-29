# Dinner Planner - AI-Powered Meal Planning App

A modern, colorful Micro-SaaS app for creating and managing weekly dinner plans with AI assistance.

## Features

### MVP (Free Tier)
- ✅ User authentication with Clerk (email/password + Google)
- ✅ Onboarding wizard (dietary preferences + household size)
- ✅ Create and manage weekly dinner plans
- ✅ Add/edit/remove meals in plans
- ✅ Meal library with search
- ✅ Share plans with other users
- ✅ Image upload for meals
- ✅ Push notifications for invites
- ✅ Modern, colorful UI with smooth animations

### Premium Tiers (Coming Soon)
- Plus ($5-7/mo): Unlimited plans, favorites, drag-and-drop
- Pro ($12-15/mo): AI meal suggestions, shopping lists
- Premium ($20-25/mo): Full AI automation, advanced collaboration

## Tech Stack

- **Frontend**: React Native + Expo
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Serverless API routes (Fetch API)
- **Database**: PostgreSQL on Supabase with Prisma ORM
- **Auth**: Clerk
- **Storage**: Supabase Storage
- **AI**: OpenAI API (server-side)
- **Notifications**: Expo Notifications

## Getting Started

### Prerequisites

- Node.js v22.12 (use `nvm use v22.12`)
- Expo CLI
- Supabase account
- Clerk account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Fill in your API keys and configuration
```

3. Set up Prisma:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (home)/            # Main app routes
│   └── (onboarding)/      # Onboarding flow
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── meals/             # Meal-related components
│   ├── plans/             # Plan-related components
│   └── sharing/           # Sharing components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   ├── api/               # API client and endpoints
│   └── utils/              # Helper functions
├── types/                 # TypeScript type definitions
├── constants/             # Design tokens and constants
├── prisma/                # Database schema
└── docs/                  # Feature notes, setup guides, SQL migrations (see subfolders)
```

Implementation write-ups, setup guides, migration SQL, and planning notes live under `docs/` (`implementations/`, `setup/`, `migrations/`, `plans/`, plus `guides/` and `api/`).

## Code Architecture

- **Pages**: Minimal logic (<100 lines), orchestration only
- **Components**: Single-responsibility, composable
- **Hooks**: Business logic and data fetching
- **Services**: API clients and external integrations
- **Utils**: Pure utility functions

## Design System

The app uses a modern, colorful design system with:
- Warm, food-inspired color palette
- Consistent spacing (4px grid)
- Smooth animations and transitions
- Accessible touch targets (44px minimum)
- Dark mode support

## Development

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

## License

Private - All rights reserved
