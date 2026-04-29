# Multi-Family Implementation

## Overview

This document describes the implementation of multi-family support in the AI Dinner Planner app. Users can now create and join multiple families, switch between them, and have their meals and plans filtered by the currently active family.

## Key Features

1. **Multiple Families**: Users can belong to multiple families simultaneously
2. **Active Family Selection**: One family is always active at a time
3. **Persistent Storage**: The active family selection is stored and persists across app sessions
4. **Family Switching**: Users can easily switch between families via the UI
5. **Scoped Data**: Meals and plans are automatically filtered by the active family

## Architecture

### 1. State Management

#### Active Family Store (`lib/stores/activeFamilyStore.ts`)

A Zustand store with persistent storage (AsyncStorage) manages the active family:

```typescript
interface ActiveFamilyState {
  activeFamilyId: number | null
  setActiveFamilyId: (familyId: number | null) => void
  clearActiveFamilyId: () => void
}
```

**Key Features:**
- Persists to AsyncStorage so the selection survives app restarts
- Provides simple getter/setter interface
- Used throughout the app to determine which family's data to show

### 2. API Updates

#### Families API (`lib/api/families.ts`)

Updated to support multiple families:

**New Method: `getAllUserFamilies()`**
- Returns an array of all families the user belongs to
- Includes membership details for each family

**Updated Method: `getCurrentUserFamily(familyId)`**
- Now takes a `familyId` parameter
- Returns details for a specific family the user belongs to

### 3. Hooks

#### useCurrentFamily (`hooks/useCurrentFamily.ts`)

Completely refactored to support multiple families:

**Returns:**
```typescript
{
  currentFamily: CurrentUserFamily | null     // Currently active family
  allFamilies: CurrentUserFamily[]           // All families user belongs to
  familyId: number | undefined               // Active family ID
  membership: FamilyMember | undefined       // User's membership in active family
  loading: boolean
  error: string | null
  refetch: () => Promise<void>               // Refresh family data
  switchFamily: (familyId: number) => void   // Switch to a different family
  hasWritePermission: () => boolean
  isAdmin: () => boolean
}
```

**Behavior:**
- Automatically fetches all families on mount
- Reads active family ID from persistent store
- If no active family is set, defaults to the first family
- If stored active family is invalid, clears it and uses first family
- Provides `switchFamily` method to change active family

#### useFamilies (`hooks/useFamilies.ts`)

Added new method:
- `getAllFamilies()`: Fetches all families the user belongs to

### 4. Components

#### FamilySwitcher (`components/family/FamilySwitcher.tsx`)

New component for switching between families:

**Features:**
- Displays current active family name
- Shows count of total families
- Opens modal to switch between families
- Allows creating new families
- Allows joining existing families via invite code
- Highlights the currently active family
- Shows role and permissions for each family

**Props:**
```typescript
interface FamilySwitcherProps {
  className?: string
  showLabel?: boolean
}
```

**Usage:**
```tsx
<FamilySwitcher className="mb-3" />
```

#### Integration

Added to `HomeHeader` component:
- Appears below the welcome message
- Visible on the home screen
- Easily accessible for switching families

### 5. Forms Updated

Both `CreateFamilyForm` and `JoinFamilyForm` now:
- Automatically set the newly created/joined family as active
- Trigger a refetch of family data after success
- Ensure seamless transition to the new family

### 6. Onboarding

Updated `useOnboarding` hook:
- Sets the newly created family as active during onboarding
- Ensures first-time users start with their family active

## Data Flow

### Switching Families

1. User clicks on `FamilySwitcher` component
2. Modal shows all available families
3. User selects a different family
4. `switchFamily()` is called with new family ID
5. Active family store is updated
6. `useCurrentFamily` hook re-evaluates
7. `useMeals` and `usePlans` hooks re-fetch data for new family
8. UI updates to show new family's data

### Creating a Family

1. User opens "Create New Family" modal
2. Enters family name
3. API creates family and membership record
4. New family ID is set as active
5. Family list refreshes
6. UI switches to show new family

### Joining a Family

1. User opens "Join with Code" modal
2. Enters 8-character invite code
3. API finds family and creates membership
4. Joined family ID is set as active
5. Family list refreshes
6. UI switches to show joined family

## Meals and Plans Filtering

Both `useMeals` and `usePlans` hooks depend on `useCurrentFamily`:

```typescript
const { familyId } = useCurrentFamily()
const api = useMealsApi(familyId)
```

**Behavior:**
- When `familyId` changes, the hooks automatically refetch data
- Only meals/plans belonging to the active family are retrieved
- Permissions are checked against active family membership
- Create/update/delete operations use the active family ID

## Database Schema

No schema changes were required. The existing schema already supported multiple families:

```prisma
model FamilyMember {
  id          Int      @id @default(autoincrement())
  familyId    Int      @map("family_id")
  clerkUserId String   @map("clerk_user_id")
  role        String   @default("member")
  permissions String   @default("read")
  joinedAt    DateTime @default(now()) @map("joined_at")
  
  family Family @relation(fields: [familyId], references: [id])
  
  @@unique([familyId, clerkUserId])
}
```

A user can have multiple `FamilyMember` records, each linking to a different family.

## User Experience

### First-Time User
1. Completes onboarding
2. Creates their first family
3. Family is automatically set as active
4. Can immediately start adding meals and plans

### Existing User Adding a Family
1. Clicks on family switcher
2. Chooses "Create New Family" or "Join with Code"
3. New family becomes active automatically
4. Can switch back to previous families anytime

### Multi-Family User
1. Sees family switcher in header
2. Current family name displayed prominently
3. Can tap to see all families
4. Switches with one tap
5. All data updates immediately

## Security and Permissions

- Users can only see families they belong to
- Each family membership has a role (admin/member) and permissions (read/write)
- API verifies family membership before returning data
- Active family selection is user-specific (stored locally)
- No user can access another user's family without an invite code

## Testing Recommendations

1. **Create Multiple Families**: Test creating 2-3 families
2. **Switch Between Families**: Verify meals and plans update correctly
3. **Join Family**: Test joining with an invite code
4. **Permissions**: Verify read-only members can't edit
5. **Persistence**: Close and reopen app, verify active family is remembered
6. **Onboarding**: Test new user flow, verify family is set active
7. **Empty States**: Test behavior when user has no families

## Future Enhancements

Potential improvements:
1. Family avatars/images
2. Family statistics (number of meals, plans)
3. Recently used families quick-switch
4. Family deletion (for admins)
5. Family name editing
6. Leave family confirmation dialog
7. Search/filter families list (if user has many)
8. Family invitation via email/SMS
9. Family activity feed
10. Cross-family meal/plan copying

## Files Changed/Created

### Created
- `lib/stores/activeFamilyStore.ts` - Active family state management
- `components/family/FamilySwitcher.tsx` - Family switching UI
- [`MULTI_FAMILY_IMPLEMENTATION.md`](MULTI_FAMILY_IMPLEMENTATION.md) — This document

### Modified
- `lib/stores/index.ts` - Export active family store
- `lib/api/families.ts` - Add `getAllUserFamilies()`, update `getCurrentUserFamily()`
- `hooks/useFamilies.ts` - Add `getAllFamilies()` method
- `hooks/useCurrentFamily.ts` - Complete refactor for multi-family support
- `hooks/useOnboarding.ts` - Set active family on creation
- `components/family/CreateFamilyForm.tsx` - Set family active on creation
- `components/family/JoinFamilyForm.tsx` - Set family active on join
- `components/home/HomeHeader.tsx` - Add FamilySwitcher component

## Summary

The multi-family implementation provides a robust, user-friendly way to manage multiple families within the app. The active family concept ensures data is always scoped correctly, while the persistent storage guarantees a seamless experience across app sessions. The architecture is extensible and maintainable, following existing patterns in the codebase.

