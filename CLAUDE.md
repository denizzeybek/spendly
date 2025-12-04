# Spendly - Family Budget Management App

## Project Overview
Spendly is a full-stack family budget management application with a Node.js backend and React Native mobile app.

## Tech Stack

### Backend (apps/api)
- Node.js + Express + TypeScript
- MongoDB + Mongoose ODM
- Swagger (API documentation)
- JWT Authentication (access + refresh tokens)
- Zod (request validation)

### Mobile (apps/mobile)
- React Native (Expo SDK 54)
- TypeScript
- Zustand (state management)
- React Navigation
- openapi-typescript-codegen (API client generation from Swagger)
- React Native Paper (UI)
- i18next (internationalization)

### Shared (packages/shared)
- Common TypeScript types
- Constants (categories, currencies)
- Utility functions

## Monorepo Structure
```
spendly/
├── apps/
│   ├── api/           # Backend Express server
│   └── mobile/        # React Native Expo app
├── packages/
│   └── shared/        # Shared types and utils
└── docs/              # Documentation
```

## Commands
```bash
# Install all dependencies
yarn install

# Backend
yarn api dev          # Start dev server
yarn api build        # Build for production
yarn api swagger:export  # Export swagger.json file

# Mobile
yarn mobile start     # Start Expo
yarn mobile gcl       # Generate API client from Swagger (API must be running!)

# Shared
yarn shared build     # Build shared package
```

## API Client Generation

The mobile app uses `openapi-typescript-codegen` to generate a typed Axios client from Swagger.

### Usage
```bash
# 1. Start API server first
yarn api dev

# 2. Generate client (in another terminal)
yarn mobile gcl
```

### Generated Structure
```
apps/mobile/src/client/
├── core/           # API core utilities (OpenAPI config, request handler)
├── models/         # TypeScript types/interfaces
├── services/       # API service classes
│   ├── AuthService.ts
│   ├── CategoriesService.ts
│   ├── HomeService.ts
│   ├── TransactionsService.ts
│   └── UsersService.ts
└── index.ts        # Main exports
```

### Example Usage
```typescript
import { AuthService, OpenAPI } from '../client';

// Configure base URL
OpenAPI.BASE = 'http://localhost:3000';

// Set auth token (will be added to all requests)
OpenAPI.TOKEN = 'your-access-token';

// API calls
const result = await AuthService.postApiAuthLogin({
  email: 'test@test.com',
  password: '123456'
});
```

## Coding Standards

### General
- TypeScript strict mode, no `any`
- ESLint + Prettier
- Conventional Commits

### Backend Patterns
- **Controller**: HTTP handling only (req/res)
- **Service**: Business logic
- **Schema**: Zod validation schemas
- **Routes**: Express routes with Swagger JSDoc
- Each module in its own folder under `src/modules/`

### Mobile Patterns
- Functional components only
- Business logic in hooks/services
- All strings through i18n
- All colors from theme
- API calls only through generated client (`src/client/services/*`)

### Naming Conventions
- Files: kebab-case (e.g., `auth.service.ts`)
- Components: PascalCase (e.g., `LoginScreen.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase with I prefix for interfaces

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/refresh - Refresh token
- GET /api/auth/me - Current user

### Home
- GET /api/home - Get home details
- PATCH /api/home - Update home (owner only)
- GET /api/home/users - Get home users
- GET /api/home/summary - Monthly summary

### Transactions
- GET /api/transactions - List (with filters)
- POST /api/transactions - Create
- GET /api/transactions/:id - Get by ID
- PATCH /api/transactions/:id - Update
- DELETE /api/transactions/:id - Delete

### Categories
- GET /api/categories - List
- POST /api/categories - Create custom
- PATCH /api/categories/:id - Update
- DELETE /api/categories/:id - Delete

### Users
- GET /api/users/me - Current user
- PATCH /api/users/me - Update
- GET /api/users/me/summary - Personal summary

## Database Models

### User
- email, password, name, homeId

### Home
- code (6-char unique), name, currency, ownerId

### Transaction
- type (INCOME/EXPENSE), title, amount, date
- categoryId, assignedCardId, isShared, isRecurring

### CreditCard
- name, userId (one per user)

### Category
- name, icon, color, type, isDefault, homeId

## Business Logic

### Shared Expense Calculation
When `isShared: true`, expense is divided equally among all home users.

### User Summary
- Total Income: User's income transactions
- Credit Card Debt: All expenses on user's card
- Shared Expense: User's share of all shared expenses
- Personal Expense: Non-shared expenses on user's card
- Balance: Income - Personal - Shared portion

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Important Notes
- Home code is 6 uppercase alphanumeric (excluding confusing chars: 0,O,I,1)
- Default categories are seeded when home is created
- Each user automatically gets a credit card on registration
- Swagger UI available at http://localhost:3000/api-docs
- Swagger JSON available at http://localhost:3000/swagger.json
- Requires Node.js >= 20.19.4 (use `nvm use 20`)
