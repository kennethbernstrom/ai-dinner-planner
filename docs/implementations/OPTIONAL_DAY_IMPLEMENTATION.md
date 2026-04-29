# Optional Day of Week Implementation

## Overview

This implementation adds the ability to add meals to a weekly plan without immediately assigning them to a specific day. This allows users to:
- Add meals to a plan for shopping list generation before scheduling
- Build up a meal collection for the week
- Assign specific days to meals later

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Made `dayOfWeek` field nullable in the `PlanMeal` model (`Int?`)
- Changed the unique constraint to a regular index to allow multiple unscheduled meals
- Updated comment to indicate null means "not yet scheduled"

### 2. TypeScript Types (`types/plan.ts`)
- Updated `PlanMeal.dayOfWeek` type from `number` to `number | null`

### 3. Validation Schema (`lib/validation/schemas.ts`)
- Made `dayOfWeek` optional and nullable in `addMealToPlanSchema`
- Now accepts `undefined` or `null` values

### 4. API Layer (`lib/api/plans.ts`)
- Updated `transformPlanMeal` to properly handle null `dayOfWeek` values
- Modified `addMeal` to accept and store null `dayOfWeek` values

### 5. UI Components

#### WeekView (`components/plans/WeekView.tsx`)
- Added "Unscheduled Meals" section at the top
- Displays all meals with `dayOfWeek === null` in a blue-themed section
- Shows count of unscheduled meals
- Distinguished visually from scheduled meals

#### WeeklyCalendar (`components/plans/WeeklyCalendar.tsx`)
- Added "Unscheduled" card showing unscheduled meals
- Displays up to 2 meals with a count of remaining
- Blue-themed to match WeekView

#### PlanCard (`components/plans/PlanCard.tsx`)
- Updated to filter out null `dayOfWeek` values when counting "days with meals"

#### PlanDetail (`components/plans/PlanDetail.tsx`)
- Added "Add Meal to Plan" button in header
- Allows adding meals without selecting a specific day first

#### PlanForm (`components/plans/PlanForm.tsx`)
- Updated meal press handler to support null `dayOfWeek`
- Added conditional "Assign to Day" action for unscheduled meals

### 6. Page Updates

#### Meals List (`app/(home)/meals/index.tsx`)
- Changed `isAddingToPlan` logic to not require `dayOfWeek`
- Updated `addMeal` call to pass null when day is not specified

#### Plan Detail Page (`app/(home)/plans/[id].tsx`)
- Added `onAddMealUnscheduled` handler
- Updated meal press handler to handle null `dayOfWeek`

## Database Migration

**IMPORTANT:** Before using this feature, you must run the database migration:

```sql
-- Run this SQL against your Supabase database
-- File: docs/migrations/OPTIONAL_DAY_OF_WEEK_MIGRATION.sql

-- Step 1: Drop the unique constraint
ALTER TABLE plan_meals DROP CONSTRAINT IF EXISTS plan_meals_plan_id_day_of_week_meal_slot_key;

-- Step 2: Make day_of_week nullable
ALTER TABLE plan_meals ALTER COLUMN day_of_week DROP NOT NULL;

-- Step 3: Add a new index for performance
CREATE INDEX IF NOT EXISTS idx_plan_meals_plan_day_slot ON plan_meals(plan_id, day_of_week, meal_slot);

-- Step 4: Add column comment
COMMENT ON COLUMN plan_meals.day_of_week IS '0-6 (Monday-Sunday), null if not yet scheduled to a specific day';
```

### How to Run Migration

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of [`OPTIONAL_DAY_OF_WEEK_MIGRATION.sql`](../migrations/OPTIONAL_DAY_OF_WEEK_MIGRATION.sql)
4. Run the query

Alternatively, if using Prisma migrations:
```bash
npx prisma migrate dev --name optional_day_of_week
```

## Usage

### Adding Meals Without a Day

1. **From Plan Detail Page:**
   - Click the "Add Meal to Plan" button in the header
   - Select a meal from the meals list
   - The meal is added without a day assignment

2. **From Plan Edit Page:**
   - Click "Add Meal" on any day (as before)
   - OR navigate to meals page without specifying a day
   - The meal is added to the plan but shown in "Unscheduled Meals"

3. **From URL/Navigation:**
   ```typescript
   // Without day - adds as unscheduled
   router.push(`/(home)/meals?addToPlan=${planId}`)
   
   // With day - adds to specific day
   router.push(`/(home)/meals?addToPlan=${planId}&day=${dayOfWeek}`)
   ```

### Viewing Unscheduled Meals

Unscheduled meals appear:
- At the top of the Week View in a blue-themed section
- In a separate "Unscheduled" card in the Weekly Calendar
- With a clear indicator that they're not assigned to a day

### Managing Unscheduled Meals

When clicking on an unscheduled meal:
- **Replace Meal:** Replace with another meal (maintains unscheduled status)
- **Assign to Day:** Placeholder for future feature to assign to a specific day
- **Remove Meal:** Remove from plan entirely
- **View Details:** View meal details

## Benefits

1. **Flexible Planning:** Users can add meals first, schedule later
2. **Shopping Lists:** Generate shopping lists before finalizing the weekly schedule
3. **Meal Pool:** Build a pool of meals for the week and assign as needed
4. **Better Workflow:** Supports users who prefer to collect meals before scheduling

## Future Enhancements

Potential improvements for this feature:
- Drag-and-drop to assign unscheduled meals to specific days
- Bulk operations (assign multiple meals at once)
- Meal suggestions based on unscheduled meals
- Filter/sort unscheduled meals by tags or preferences
- "Auto-schedule" feature to automatically distribute unscheduled meals

## Testing Checklist

- [ ] Can add meals without specifying a day
- [ ] Unscheduled meals appear in the "Unscheduled Meals" section
- [ ] Can view and manage unscheduled meals
- [ ] Can still add meals to specific days (existing functionality)
- [ ] Unscheduled meals are included in shopping list generation
- [ ] Plan duplication handles unscheduled meals correctly
- [ ] Filtering by day works correctly (excludes null values)
- [ ] No linter errors in modified files

## Files Modified

- `prisma/schema.prisma`
- `types/plan.ts`
- `lib/validation/schemas.ts`
- `lib/api/plans.ts`
- `components/plans/WeekView.tsx`
- `components/plans/WeeklyCalendar.tsx`
- `components/plans/PlanCard.tsx`
- `components/plans/PlanDetail.tsx`
- `components/plans/PlanForm.tsx`
- `app/(home)/meals/index.tsx`
- `app/(home)/plans/[id].tsx`

## Files Created

- [`OPTIONAL_DAY_OF_WEEK_MIGRATION.sql`](../migrations/OPTIONAL_DAY_OF_WEEK_MIGRATION.sql) — Database migration script
- [`OPTIONAL_DAY_IMPLEMENTATION.md`](OPTIONAL_DAY_IMPLEMENTATION.md) — This documentation file

