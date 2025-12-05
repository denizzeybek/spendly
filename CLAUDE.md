# Spendly - Family Budget Management App

## !! MANDATORY RULES - MUST FOLLOW ON EVERY PROMPT !!

> **These rules are NON-NEGOTIABLE. Apply them to EVERY code change without exception.**

### 1. DRY (Don't Repeat Yourself) Principle
- **NEVER duplicate code** - Extract repeated logic into reusable functions/components
- If you see similar code in 2+ places, create a shared utility or component
- Reusable components go in `src/components/`
- Reusable utilities go in `src/utils/`
- Reusable hooks go in `src/hooks/` or `src/views/{feature}/_hooks/`

### 2. Maximum 350 Lines Per File
- **NO component file can exceed 350 lines**
- If approaching limit, split into sub-components in `_components/` folder
- Modals, forms, and list items should ALWAYS be separate components

### 3. Folder Structure Compliance
- `app/` files are **ONLY minimal wrappers** (1-2 lines, just re-export)
- All logic lives in `src/views/{feature}/`
- View-specific components: `src/views/{feature}/_components/`
- Global components: `src/components/`

### 4. TypeScript Strict Mode
- NO `any` type usage
- All functions must have typed parameters and return types
- All props must have interfaces

### 5. Code Quality Checks
- Run `npx tsc --noEmit` before committing
- Run `npx eslint` before committing
- Fix ALL errors and warnings

---

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
- Expo Router (file-based routing)
- GlueStack UI (component library)
- openapi-typescript-codegen (API client generation from Swagger)
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

## Mobile App Folder Structure

```
apps/mobile/
├── app/                      # Expo Router - MINIMAL WRAPPERS ONLY!
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx         # export { Login as default } from '../../src/views/auth'
│   │   └── register.tsx      # export { Register as default } from '../../src/views/auth'
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # export { default } from '../../src/views/home'
│   │   ├── transactions.tsx
│   │   ├── add.tsx
│   │   ├── reports.tsx
│   │   └── settings.tsx
│   ├── categories.tsx
│   ├── credit-cards.tsx
│   ├── loans.tsx
│   └── _layout.tsx
├── src/
│   ├── client/               # Auto-generated API client (DO NOT EDIT!)
│   ├── components/           # GLOBAL shared components only
│   │   ├── AddCategoryModal.tsx
│   │   ├── CategoryDropdown.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FilterChips.tsx
│   │   └── index.ts
│   ├── constants/
│   │   ├── presets.ts
│   │   └── theme.ts
│   ├── locales/
│   │   ├── en.json
│   │   ├── tr.json
│   │   └── i18n.ts
│   ├── services/             # Native services (notifications, storage)
│   ├── store/                # Zustand stores (one per feature)
│   ├── types/
│   ├── utils/
│   └── views/                # ALL VIEW LOGIC LIVES HERE!
│       ├── {feature}/
│       │   ├── {Feature}.tsx       # Main view (max 350 lines)
│       │   ├── _components/        # View-specific components
│       │   │   ├── {Component}.tsx
│       │   │   └── index.ts
│       │   └── index.ts
```

## Commands
```bash
# Install all dependencies
yarn install

# Backend
yarn api dev              # Start dev server
yarn api build            # Build for production
yarn api swagger:export   # Export swagger.json

# Mobile
yarn mobile start         # Start Expo
yarn mobile gcl           # Generate API client from Swagger

# Code Quality
npx tsc --noEmit          # TypeScript check
npx eslint src/           # Lint check
```

---

## React Native Development Guidelines

### Component Architecture

#### File Size Rule
```
HARD LIMIT: 350 lines per component file

If exceeding:
1. Extract sub-components to _components/
2. Extract hooks to _hooks/
3. Extract utilities to _utils/ or src/utils/
```

#### Component Template
```typescript
// 1. External imports
import { useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';

// 2. Internal imports
import { useMyStore } from '../../store';
import { formatCurrency } from '../../utils';
import { MyItem, MyModal } from './_components';
import type { MyItemType } from '../../types';

// 3. Types (if not imported)
interface MyScreenProps {
  initialId?: string;
}

// 4. Component
export default function MyScreen({ initialId }: MyScreenProps) {
  const { t } = useTranslation();

  // Store hooks (use selectors!)
  const items = useMyStore((state) => state.items);
  const { fetchItems, isLoading } = useMyStore();

  // Local state
  const [selectedItem, setSelectedItem] = useState<MyItemType | null>(null);

  // Fetch on focus
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  // Memoized values
  const filteredItems = useMemo(() =>
    items.filter(item => item.active),
    [items]
  );

  // Handlers (useCallback for child props)
  const handleItemPress = useCallback((item: MyItemType) => {
    setSelectedItem(item);
  }, []);

  // Render
  return (
    <Box flex={1} bg="$backgroundLight50" sx={{ _dark: { bg: '$backgroundDark950' } }}>
      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <MyItem item={item} onPress={handleItemPress} />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchItems} />
        }
      />

      <MyModal
        visible={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
```

### DRY Principle Implementation

#### When to Extract Components
```typescript
// BAD - Repeated JSX
{items.map(item => (
  <Box p="$4" borderRadius="$xl" bg="$backgroundLight0">
    <HStack space="md">
      <Box w="$12" h="$12" borderRadius="$full" bg={item.color}>
        <Text>{item.icon}</Text>
      </Box>
      <VStack>
        <Text fontWeight="$bold">{item.name}</Text>
        <Text color="$textLight500">{item.description}</Text>
      </VStack>
    </HStack>
  </Box>
))}

// GOOD - Extracted component
// _components/ItemCard.tsx
export function ItemCard({ item, onPress }: ItemCardProps) {
  return (
    <Pressable onPress={() => onPress(item)}>
      <Box p="$4" borderRadius="$xl" bg="$backgroundLight0">
        <HStack space="md">
          <IconBox icon={item.icon} color={item.color} />
          <VStack>
            <Text fontWeight="$bold">{item.name}</Text>
            <Text color="$textLight500">{item.description}</Text>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );
}

// Main component
{items.map(item => (
  <ItemCard key={item.id} item={item} onPress={handlePress} />
))}
```

#### When to Extract Utilities
```typescript
// BAD - Repeated formatting logic
<Text>{new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</Text>
<Text>{new Date(other.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</Text>

// GOOD - Extracted to utils
// src/utils/index.ts
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

// Usage
<Text>{formatDate(item.date)}</Text>
```

#### When to Extract Hooks
```typescript
// BAD - Repeated logic in multiple components
const [isOpen, setIsOpen] = useState(false);
const animation = useRef(new Animated.Value(0)).current;

const toggle = () => {
  setIsOpen(!isOpen);
  Animated.timing(animation, {
    toValue: isOpen ? 0 : 1,
    duration: 200,
    useNativeDriver: false,
  }).start();
};

// GOOD - Custom hook
// _hooks/useAnimatedToggle.ts
export function useAnimatedToggle(duration = 200) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.timing(animation, { toValue, duration, useNativeDriver: false }).start();
  }, [isOpen, animation, duration]);

  return { isOpen, animation, toggle };
}
```

### State Management (Zustand)

#### Store Structure
```typescript
// src/store/feature.store.ts
import { create } from 'zustand';
import { FeatureService } from '../client';
import type { ApiError } from '../types';

interface FeatureState {
  // Data
  items: Item[];
  selectedItem: Item | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error
  error: string | null;

  // Actions
  fetchItems: () => Promise<void>;
  createItem: (data: CreateItemData) => Promise<void>;
  updateItem: (id: string, data: UpdateItemData) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setSelectedItem: (item: Item | null) => void;
  clearError: () => void;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  items: [],
  selectedItem: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await FeatureService.getItems();
      set({ items: response.data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.body?.message || error.message, isLoading: false });
    }
  },

  // ... other actions
}));
```

#### Using Selectors (Performance)
```typescript
// GOOD - Only re-renders when specific data changes
const items = useFeatureStore((state) => state.items);
const isLoading = useFeatureStore((state) => state.isLoading);
const { fetchItems, createItem } = useFeatureStore();

// BAD - Re-renders on ANY store change
const store = useFeatureStore();
```

### Styling Guidelines

#### Theme Colors
```typescript
// Always use theme tokens, never hardcoded colors
// GOOD
<Box bg="$backgroundLight0" sx={{ _dark: { bg: '$backgroundDark900' } }}>
<Text color="$textLight500" sx={{ _dark: { color: '$textDark400' } }}>

// BAD
<Box bg="#ffffff">
<Text color="#6b7280">
```

#### StyleSheet for Complex Styles
```typescript
// Extract to StyleSheet when styles are complex or reused
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
});
```

### Performance Optimizations

#### Lists
```typescript
// ALWAYS use FlatList for dynamic lists
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>

// NEVER use ScrollView + map for dynamic data
// Only use for static, small lists (< 10 items)
```

#### Memoization
```typescript
// useMemo for expensive computations
const filteredItems = useMemo(() =>
  items.filter(item => item.type === filter).sort((a, b) => b.date - a.date),
  [items, filter]
);

// useCallback for functions passed to children
const handlePress = useCallback((item: Item) => {
  setSelected(item);
}, []);

// React.memo for pure child components
export const ItemCard = React.memo(function ItemCard({ item, onPress }: Props) {
  // ...
});
```

### Internationalization

```typescript
// All user-facing text must use translations
const { t } = useTranslation();

// Correct
<Text>{t('transactions.noTransactions')}</Text>
<Button><ButtonText>{t('common.save')}</ButtonText></Button>

// Wrong
<Text>No transactions found</Text>
```

### Error Handling

```typescript
// Always handle loading and error states
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} onRetry={fetchData} />;
}

// In forms, show validation errors
{error && (
  <Text color="$error500" textAlign="center">
    {error}
  </Text>
)}
```

---

## API Client Generation

```bash
# 1. Start API server
yarn api dev

# 2. Generate client
yarn mobile gcl
```

### Usage
```typescript
import { AuthService, OpenAPI } from '../client';

OpenAPI.BASE = 'http://localhost:3000';
OpenAPI.TOKEN = 'your-access-token';

const result = await AuthService.postApiAuthLogin({
  email: 'test@test.com',
  password: '123456'
});
```

---

## Backend Patterns
- **Controller**: HTTP handling only (req/res)
- **Service**: Business logic
- **Schema**: Zod validation schemas
- **Routes**: Express routes with Swagger JSDoc

---

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me

### Home
- GET /api/home
- PATCH /api/home
- GET /api/home/users
- GET /api/home/summary
- GET /api/home/user-summaries

### Transactions
- GET /api/transactions
- POST /api/transactions
- GET /api/transactions/:id
- PATCH /api/transactions/:id
- DELETE /api/transactions/:id

### Categories
- GET /api/categories
- POST /api/categories
- PATCH /api/categories/:id
- DELETE /api/categories/:id

### Credit Cards
- GET /api/credit-cards
- POST /api/credit-cards
- PATCH /api/credit-cards/:id
- DELETE /api/credit-cards/:id

### Loans
- GET /api/loans
- POST /api/loans
- PATCH /api/loans/:id
- DELETE /api/loans/:id
- POST /api/loans/:id/pay

---

## Database Models

### User
- email, password, name, homeId

### Home
- code (6-char), name, currency, ownerId

### Transaction
- type, title, amount, date, categoryId, assignedCardId, isShared, isRecurring

### CreditCard
- name, userId, billingDate

### Category
- name, icon, color, type, isDefault, homeId

### Loan
- name, totalAmount, installmentCount, paidInstallments, startDate

---

## Important Notes
- Home code: 6 uppercase alphanumeric (no 0,O,I,1)
- Default categories seeded on home creation
- Auto credit card on user registration
- Swagger UI: http://localhost:3000/api-docs
- Node.js >= 20.19.4 required
