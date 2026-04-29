# Family System Implementation Guide

This document describes the family/team system that has been implemented for the AI Dinner Planner app.

## Overview

The family system allows multiple users to collaborate on meal planning and share weekly plans. Each family has:
- A unique invite code for adding members
- An admin who can manage members and set permissions
- Members with either read or write permissions

## What Has Been Implemented

### 1. Database Schema Updates

**New Tables:**
- `families` - Stores family information and invite codes
- `family_members` - Junction table linking users to families with roles and permissions

**Updated Tables:**
- `meals` - Now includes `family_id` (previously only had `clerk_user_id`)
- `weekly_plans` - Now includes `family_id` (previously only had `clerk_user_id`)

**Schema File:** `prisma/schema.prisma`

### 2. TypeScript Types

**New Types:** `types/family.ts`
- `Family` - Family entity
- `FamilyMember` - Member with role and permissions
- `FamilyWithMembers` - Family with its members
- `CurrentUserFamily` - Current user's family context

**Updated Types:**
- `Meal` - Added `familyId` field
- `WeeklyPlan` - Added `familyId` field

### 3. Validation Schemas

**New Schemas:** `lib/validation/schemas.ts`
- `createFamilySchema` - For creating a new family
- `joinFamilySchema` - For joining via invite code
- `updateFamilyMemberSchema` - For updating member permissions
- `onboardingSchema` - Updated to include `familyName`

### 4. API Functions

**New API File:** `lib/api/families.ts`
- `createFamily()` - Create a new family
- `joinFamily()` - Join family with invite code
- `getCurrentUserFamily()` - Get user's current family
- `getFamilyById()` - Get family details
- `getFamilyMembers()` - Get all family members
- `updateFamilyMember()` - Update member role/permissions
- `removeFamilyMember()` - Remove a member
- `leaveFamily()` - Leave a family
- `regenerateInviteCode()` - Generate new invite code

**Updated API Files:**
- `lib/api/meals.ts` - Now filters by `family_id`
- `lib/api/plans.ts` - Now filters by `family_id`

### 5. React Hooks

**New Hooks:**
- `hooks/useFamilies.ts` - Manage family operations
- `hooks/useCurrentFamily.ts` - Access current family context

**Updated Hooks:**
- `hooks/useMeals.ts` - Added family filtering and permission checks
- `hooks/usePlans.ts` - Added family filtering and permission checks
- `hooks/useOnboarding.ts` - Creates family during onboarding

### 6. UI Components

**New Components:**
- `components/family/FamilySettings.tsx` - View/manage family and members
- `components/family/CreateFamilyForm.tsx` - Form to create a family
- `components/family/JoinFamilyForm.tsx` - Form to join via invite code

**Updated Components:**
- `components/onboarding/OnboardingForm.tsx` - Added step 3 for family creation

### 7. Permission System

The system implements two permission levels:
- **Read**: Can view meals and plans
- **Write**: Can create, update, and delete meals and plans

Admins automatically have write permissions and can:
- Manage family members
- Change member permissions
- Remove members
- Regenerate invite codes

## What Still Needs to Be Done

### 1. Database Migration

You need to run the database migration to add the new tables and columns:

```bash
# If using Prisma
npx prisma migrate dev --name add_family_system

# Or manually run the SQL in docs/migrations/FAMILY_SYSTEM_MIGRATION.sql
```

### 2. Backend API Routes

You need to create backend API endpoints to support the family operations. These should be added as API routes in your backend (e.g., Next.js API routes, Express endpoints, etc.):

**Required Endpoints:**
- `POST /api/families` - Create family
- `POST /api/families/join` - Join family
- `GET /api/families/current` - Get current user's family
- `GET /api/families/:id` - Get family by ID
- `GET /api/families/:id/members` - Get family members
- `PATCH /api/families/:id/members/:memberId` - Update member
- `DELETE /api/families/:id/members/:memberId` - Remove member
- `POST /api/families/:id/leave` - Leave family
- `PATCH /api/families/:id` - Update family (for invite code regeneration)

Each endpoint should:
- Verify user authentication via Clerk
- Check user permissions (admin for management operations)
- Use Prisma/Supabase to interact with the database
- Return appropriate error messages

### 3. Update Existing API Routes

Your existing API routes for meals and plans need to be updated to:
- Check that operations are scoped to the user's family
- Verify write permissions for create/update/delete operations
- Filter results by family_id

### 4. Navigation and UI Integration

Add navigation to the family settings:
- Add a "Family Settings" link in your app's navigation/settings
- Create a route like `app/(home)/settings/family.tsx` that uses `FamilySettings` component
- Consider adding family name/info to the home screen header

### 5. Handle Edge Cases

Consider these scenarios:
- User leaves their only family (should they be forced to create/join another?)
- Last admin leaves a family (promote another member or delete family?)
- User tries to create meals without a family (show error or prompt to create/join)

### 6. Testing

Test the following flows:
- New user onboarding with family creation
- Existing user joining a family via invite code
- Admin managing member permissions
- Read-only member attempting to create/edit (should be blocked)
- Family member viewing shared meals and plans

### 7. Data Migration (If You Have Existing Users)

If you already have users and data:
1. Create a migration script to:
   - Create a family for each existing user
   - Add them as admin with write permissions
   - Update all their meals and plans to reference the new family
2. See the commented example in [`FAMILY_SYSTEM_MIGRATION.sql`](../migrations/FAMILY_SYSTEM_MIGRATION.sql)

## Key Concepts

### Family Context

The `useCurrentFamily` hook provides the family context throughout the app:
```typescript
const { 
  currentFamily,     // Current family object
  familyId,          // Current family ID
  membership,        // Current user's membership info
  hasWritePermission,// Function to check write access
  isAdmin,           // Function to check admin status
  refetch            // Refresh family data
} = useCurrentFamily()
```

### Permission Checks

All create/update/delete operations check permissions:
```typescript
// In useMeals hook
const createMeal = useCallback(async (input) => {
  if (!hasWritePermission()) {
    return { error: 'You do not have permission to create meals' }
  }
  // ... create meal
}, [hasWritePermission])
```

### Invite Codes

- 8-character alphanumeric codes
- Unique per family
- Can be regenerated by admin
- Used to invite new members

## File Structure

```
prisma/
  schema.prisma                         # Updated schema

lib/
  api/
    families.ts                         # NEW: Family API functions
    meals.ts                            # UPDATED: Family filtering
    plans.ts                            # UPDATED: Family filtering
  validation/
    schemas.ts                          # UPDATED: Family schemas

hooks/
  useFamilies.ts                        # NEW: Family management
  useCurrentFamily.ts                   # NEW: Family context
  useMeals.ts                           # UPDATED: Permission checks
  usePlans.ts                           # UPDATED: Permission checks
  useOnboarding.ts                      # UPDATED: Family creation

components/
  family/
    FamilySettings.tsx                  # NEW: Settings UI
    CreateFamilyForm.tsx                # NEW: Create form
    JoinFamilyForm.tsx                  # NEW: Join form
  onboarding/
    OnboardingForm.tsx                  # UPDATED: Family step

types/
  family.ts                             # NEW: Family types
  meal.ts                               # UPDATED: Added familyId
  plan.ts                               # UPDATED: Added familyId

docs/migrations/FAMILY_SYSTEM_MIGRATION.sql       # NEW: Migration SQL
docs/implementations/FAMILY_SYSTEM_IMPLEMENTATION.md  # NEW: This file
```

## Example User Flows

### New User Onboarding
1. User signs up with Clerk
2. Completes dietary preferences step
3. Enters household size
4. Creates their first family (becomes admin with write permissions)
5. Can invite others via invite code

### Joining a Family
1. User gets invite code from family admin
2. Goes to "Join Family" screen
3. Enters 8-character code
4. Joins as member with read permissions (admin can upgrade to write)

### Managing Family Members (Admin)
1. Navigate to Family Settings
2. View list of all members with their roles and permissions
3. Toggle member permissions between read/write
4. Remove members if needed
5. Share or regenerate invite code

## Next Steps

1. Run the database migration
2. Implement the backend API routes
3. Test the onboarding flow
4. Test family creation and invitation
5. Test permission system with multiple users
6. Consider adding more features:
   - Family profile pictures
   - Multiple families per user
   - Family-specific meal tags or preferences
   - Activity feed showing family member actions

## Questions or Issues?

If you encounter issues:
1. Check that Prisma schema is properly synced: `npx prisma generate`
2. Verify database migrations are applied
3. Ensure Clerk authentication is working
4. Check browser console for API errors
5. Verify Supabase RLS policies if using Supabase

## Security Considerations

- All family operations are authenticated via Clerk
- Database queries filter by family_id to prevent cross-family data access
- Write operations check permissions before executing
- Admin operations verify admin role
- Invite codes are unique and can be regenerated if compromised
- Consider adding rate limiting to prevent invite code brute force

