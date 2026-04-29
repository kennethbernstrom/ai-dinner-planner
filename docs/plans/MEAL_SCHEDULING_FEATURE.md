# Meal Scheduling Feature

## Overview

This document describes the implementation of the meal scheduling feature, which allows users to:
1. Schedule unscheduled meals to specific days in a weekly plan
2. Move already-scheduled meals to different days
3. Choose between scheduling existing unscheduled meals or adding new meals when clicking empty day slots

## User Stories

### Story 1: Schedule an Unscheduled Meal
**As a user**, when I click on an unscheduled meal in the plan view, I want to be able to select a day to schedule it.

**Flow:**
1. User views a weekly plan with unscheduled meals
2. User clicks on an unscheduled meal
3. Alert appears with options:
   - "Schedule to Day" - Opens day selector
   - "Remove Meal" - Removes the meal from the plan
   - "View Details" - Navigates to meal detail page
   - "Cancel" - Dismisses the alert
4. If "Schedule to Day" is selected, another alert shows all 7 days
5. User selects a day (Monday-Sunday)
6. Meal is scheduled to that day
7. Success message appears

### Story 2: Move a Scheduled Meal
**As a user**, when I click on a meal that's already scheduled, I want to be able to move it to a different day.

**Flow:**
1. User views a weekly plan with scheduled meals
2. User clicks on a scheduled meal
3. Alert appears with options:
   - "Move to Different Day" - Opens day selector
   - "Replace Meal" - Allows selecting a different meal for this slot
   - "Remove Meal" - Removes the meal from the plan
   - "View Details" - Navigates to meal detail page
   - "Cancel" - Dismisses the alert
4. If "Move to Different Day" is selected, day selector appears
5. User selects a new day
6. Meal is moved to the new day
7. Success message appears

### Story 3: Add Meal to Empty Day
**As a user**, when I click on an empty day slot, I want to choose between scheduling an existing unscheduled meal or adding a new meal.

**Flow:**
1. User views a weekly plan with empty day slots
2. User clicks on an empty day slot (e.g., "Add meal for Tuesday")
3. System checks if there are unscheduled meals
4. **If unscheduled meals exist:**
   - Alert shows: "You have X unscheduled meal(s). Would you like to schedule one of them or add a new meal?"
   - Options:
     - "Schedule Existing Meal" - Shows list of unscheduled meals
     - "Add New Meal" - Opens meal selection/creation
     - "Cancel"
   - If "Schedule Existing Meal" selected, user sees list of unscheduled meals by title
   - User selects a meal, it's immediately scheduled to that day
5. **If no unscheduled meals:**
   - Directly opens meal selection/creation screen for that day

## Implementation Details

### Files Modified

#### `/app/(home)/plans/[id].tsx`

**Added Hook:**
```typescript
const { removePlanMeal, updateMeal } = usePlanMeals(planId || 0)
```
- Now includes `updateMeal` method to update meal's day assignment

**New Function: `handleScheduleToDay`**
```typescript
const handleScheduleToDay = (planMeal: PlanMeal) => {
  // Shows alert with all 7 days
  // Calls updateMeal API to assign the selected day
  // Shows success/error message
}
```

**Updated Function: `handleMealPress`**
- Now checks if meal is scheduled or unscheduled
- **For unscheduled meals** (`dayOfWeek === null`):
  - Primary action: "Schedule to Day"
  - Simplified options (no "Replace Meal")
- **For scheduled meals** (`dayOfWeek !== null`):
  - Added: "Move to Different Day" option
  - Kept all existing options

**Enhanced Function: `onAddMeal` callback**
- Now checks for unscheduled meals before opening meal selector
- If unscheduled meals exist, offers choice:
  1. Schedule an existing unscheduled meal
  2. Add a new meal
- If no unscheduled meals, goes directly to add new meal flow
- Uses `getPlan` to fetch current plan state
- Uses `updateMeal` to schedule selected meal

### API Methods Used

#### `updateMeal` (from `usePlanMeals`)
```typescript
updateMeal(mealId: number, input: UpdatePlanMealInput): Promise<ApiResponse<PlanMeal>>
```

**Input Schema:**
```typescript
interface UpdatePlanMealInput {
  dayOfWeek?: number  // 0-6 (Monday-Sunday)
  mealSlot?: 'breakfast' | 'lunch' | 'dinner'
}
```

**Usage in Scheduling:**
```typescript
await updateMeal(planMeal.mealId, {
  dayOfWeek: dayOfWeek,  // 0=Monday, 6=Sunday
})
```

### User Interface

#### Alert Buttons Order

**For Unscheduled Meals:**
1. Cancel (style: cancel)
2. **Schedule to Day** ⭐ (primary action)
3. Remove Meal (style: destructive)
4. View Details

**For Scheduled Meals:**
1. Cancel (style: cancel)
2. **Move to Different Day** ⭐ (new action)
3. Replace Meal
4. Remove Meal (style: destructive)
5. View Details

**For Empty Day Slots (with unscheduled meals):**
1. Cancel (style: cancel)
2. **Schedule Existing Meal** ⭐ (recommended)
3. Add New Meal

#### Day Selector Alert

Shows all 7 days:
- Monday (0)
- Tuesday (1)
- Wednesday (2)
- Thursday (3)
- Friday (4)
- Saturday (5)
- Sunday (6)
- Cancel

### Success Messages

- **When scheduling:** "Meal scheduled for [Day Name]"
- **Error handling:** Shows specific error message from API

## Benefits

### User Experience
1. **Reduced friction**: Schedule meals directly from the plan view
2. **Flexibility**: Easily move meals between days
3. **Smart suggestions**: System offers to schedule existing unscheduled meals before adding new ones
4. **Clear feedback**: Success/error messages confirm actions

### Workflow Improvements
1. **Fewer steps**: No need to navigate to separate screens to schedule meals
2. **Context aware**: Different options for scheduled vs unscheduled meals
3. **Prevents orphaned meals**: Reminds users of unscheduled meals when adding to days
4. **Intuitive**: Uses familiar alert patterns for quick actions

## Edge Cases Handled

1. **Multiple unscheduled meals**: Shows count and lists all options
2. **No unscheduled meals**: Skips the choice and goes directly to add meal
3. **Already occupied day**: Can schedule multiple meals to same day (system allows it)
4. **API errors**: Shows error alert with specific message
5. **Loading states**: Handled by underlying hooks

## Testing Scenarios

### Test 1: Schedule Unscheduled Meal
1. Create a plan
2. Add a meal without specifying a day (unscheduled)
3. View the plan - meal appears in "Unscheduled Meals" section
4. Click the unscheduled meal
5. Verify "Schedule to Day" option appears
6. Click "Schedule to Day"
7. Select a day (e.g., Wednesday)
8. Verify meal appears in Wednesday slot
9. Verify "Unscheduled Meals" count decreases

### Test 2: Move Scheduled Meal
1. Create a plan with a meal scheduled to Monday
2. Click the Monday meal
3. Verify "Move to Different Day" option appears
4. Click "Move to Different Day"
5. Select Friday
6. Verify meal moves from Monday to Friday

### Test 3: Add to Empty Day with Unscheduled Meals
1. Create a plan with 2 unscheduled meals
2. Click empty Tuesday slot
3. Verify alert shows "You have 2 unscheduled meals..."
4. Click "Schedule Existing Meal"
5. Verify list shows both meal titles
6. Select one meal
7. Verify meal appears in Tuesday slot
8. Verify unscheduled count decreases to 1

### Test 4: Add to Empty Day without Unscheduled Meals
1. Create a plan with no unscheduled meals
2. Click empty Thursday slot
3. Verify it goes directly to meal selection screen
4. No alert about unscheduled meals appears

### Test 5: Error Handling
1. Simulate network error or invalid data
2. Attempt to schedule a meal
3. Verify error alert appears with message
4. Verify meal is not moved/scheduled

## Future Enhancements

Potential improvements for future iterations:

1. **Drag and Drop**: Allow dragging unscheduled meals to day slots
2. **Bulk Scheduling**: Schedule multiple unscheduled meals at once
3. **Smart Suggestions**: AI-powered day suggestions based on preferences
4. **Conflict Detection**: Warn if scheduling too many meals on one day
5. **Quick Schedule**: Long-press on unscheduled meal to show inline day picker
6. **Undo Action**: Allow undo after scheduling
7. **Calendar View**: Alternative view with drag-drop interface
8. **Recurring Meals**: Schedule same meal for multiple days
9. **Auto-Schedule**: Automatically distribute unscheduled meals across the week
10. **Time Slots**: Add breakfast/lunch slots in addition to dinner

## Related Documentation

- [`MULTI_FAMILY_IMPLEMENTATION.md`](../implementations/MULTI_FAMILY_IMPLEMENTATION.md) — Family context system
- [`OPTIONAL_DAY_IMPLEMENTATION.md`](../implementations/OPTIONAL_DAY_IMPLEMENTATION.md) — Unscheduled meals feature
- `hooks/usePlanMeals.ts` - API hook for meal operations
- `lib/api/plans.ts` - Plans API implementation

## Summary

The meal scheduling feature provides a seamless way to organize weekly meal plans by:
- Making it easy to schedule unscheduled meals
- Allowing quick rescheduling of meals
- Intelligently suggesting existing meals when adding to empty days
- Providing clear, contextual options based on meal state

This feature significantly improves the meal planning workflow and reduces the steps needed to organize a weekly plan.

