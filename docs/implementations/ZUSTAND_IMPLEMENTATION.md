# Zustand State Management Implementation

## Overview
Implemented Zustand for centralized state management across the AI Dinner Planner app, enabling real-time updates when data changes.

## What Was Done

### 1. Installed Dependencies
- Added `zustand` package to the project

### 2. Created Zustand Stores

#### `lib/stores/plansStore.ts`
- Manages the list of weekly plans
- Tracks plans by ID for quick lookups
- Handles CRUD operations: add, update, remove, setPlanWithMeals
- Includes loading and error states

#### `lib/stores/mealsStore.ts`
- Manages the list of meals
- Tracks meals by ID for quick lookups
- Handles CRUD operations: add, update, remove, setMealById
- Includes loading and error states

#### `lib/stores/currentWeekStore.ts`
- Manages the current week's plan with full details
- Handles plan meal operations: add, update, remove, replace
- Ensures the home page always shows the latest current week data
- Includes loading and error states

### 3. Updated Hooks to Use Stores

#### `hooks/usePlans.ts`
- Integrated with `usePlansStore`
- All CRUD operations now update the centralized store
- Multiple components can access the same plans data without duplicate fetches

#### `hooks/useMeals.ts`
- Integrated with `useMealsStore`
- All CRUD operations now update the centralized store
- Meal list stays in sync across all components

#### `hooks/useCurrentWeekPlan.ts`
- Integrated with `useCurrentWeekStore`
- Fetches and stores the current week's plan
- Updates automatically propagate to all components using this hook

#### `hooks/usePlanMeals.ts`
- Updates both `currentWeekStore` and `plansStore` when meals are modified
- Ensures real-time updates when adding/removing/updating meals in a plan
- Refreshes plan data after operations to maintain consistency

### 4. Added Navigation Focus Listeners

Added `useFocusEffect` hooks to key screens to refetch data when they come into focus:

- **`app/(home)/index.tsx`**: Refetches current week plan
- **`app/(home)/meals/[id].tsx`**: Refetches meal details
- **`components/plans/PlansList.tsx`**: Refetches all plans
- **`components/meals/MealsList.tsx`**: Refetches all meals

This ensures that when users navigate between screens (e.g., after adding a meal to a plan), they see the latest data immediately.

## Benefits

### Real-Time Updates
- When a meal is added to a plan, the change is immediately reflected in:
  - The home page week view
  - The plan detail page
  - The plans list
- When a meal is created/updated, it appears immediately in the meals list

### Performance
- Reduced unnecessary API calls
- Data is cached in the store and shared across components
- Only fetches when needed (on focus or manual refresh)

### Consistency
- Single source of truth for each data type
- No state synchronization issues between components
- Automatic propagation of changes

### Developer Experience
- Cleaner component code
- Easier to manage state
- Predictable data flow
- Easy to debug with Zustand DevTools (if added)

## Store Architecture

```
┌─────────────────┐
│  usePlansStore  │ ← Manages all weekly plans
└────────┬────────┘
         │
         ├─ plans: WeeklyPlan[]
         ├─ plansById: Map<id, PlanWithMeals>
         ├─ loading, error
         └─ actions: setPlans, addPlan, updatePlan, etc.

┌─────────────────────┐
│ useCurrentWeekStore │ ← Manages current week plan
└──────────┬──────────┘
           │
           ├─ currentWeekPlan: PlanWithMeals | null
           ├─ loading, error
           └─ actions: setCurrentWeekPlan, addMealToPlan, etc.

┌─────────────────┐
│  useMealsStore  │ ← Manages all meals
└────────┬────────┘
         │
         ├─ meals: Meal[]
         ├─ mealsById: Map<id, Meal>
         ├─ loading, error
         └─ actions: setMeals, addMeal, updateMeal, etc.
```

## Data Flow Example

### Adding a Meal to Current Week Plan

1. User selects a meal from the meals list
2. `usePlanMeals.addMeal()` is called
3. API request is made to backend
4. On success:
   - `currentWeekStore.addMealToPlan()` is called → Updates current week plan immediately
   - `plansStore.setPlanWithMeals()` is called → Updates plan in plans list
5. Both the home page and plan detail page see the update instantly
6. When user navigates back, `useFocusEffect` ensures latest data is loaded

## Next Steps (Optional Enhancements)

1. **Add Zustand DevTools**: For debugging state changes in development
2. **Persist Store**: Use zustand/middleware/persist to cache data locally
3. **Optimistic Updates**: Update UI before API response for faster UX
4. **WebSocket Integration**: Connect stores to real-time backend events
5. **Selective Re-renders**: Use shallow comparison for better performance

## Testing

All components should be tested to ensure:
- State updates propagate correctly
- Focus listeners trigger data refreshes
- Multiple operations don't cause race conditions
- Error states are handled properly

## Files Modified

### New Files
- `lib/stores/plansStore.ts`
- `lib/stores/mealsStore.ts`
- `lib/stores/currentWeekStore.ts`
- `lib/stores/index.ts`

### Modified Files
- `hooks/usePlans.ts`
- `hooks/useMeals.ts`
- `hooks/useCurrentWeekPlan.ts`
- `hooks/usePlanMeals.ts`
- `app/(home)/index.tsx`
- `app/(home)/meals/[id].tsx`
- `components/plans/PlansList.tsx`
- `components/meals/MealsList.tsx`
- `package.json` (added zustand)

## Notes

- All stores use immutable updates to ensure React re-renders correctly
- Maps are used for quick ID-based lookups without array iteration
- Loading and error states are managed at the store level
- Stores are reset on logout (can be called manually if needed)

