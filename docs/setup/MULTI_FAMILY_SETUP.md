# Multi-Family Feature Setup Guide

## Installation Steps

### 1. Install Dependencies

Since we added `@react-native-async-storage/async-storage` to the dependencies, you need to install it:

```bash
npm install
```

Or if using yarn:

```bash
yarn install
```

### 2. Rebuild the Native App

Since AsyncStorage requires native code, you'll need to rebuild:

**For iOS:**
```bash
npx expo prebuild --platform ios
npx expo run:ios
```

Or if using EAS:
```bash
eas build --platform ios --profile development
```

**For Android:**
```bash
npx expo prebuild --platform android
npx expo run:android
```

Or if using EAS:
```bash
eas build --platform android --profile development
```

### 3. Clear Cache (Optional but Recommended)

```bash
npx expo start --clear
```

## Testing the Feature

### 1. Test with Existing User

If you have existing users with families:

1. Log in with an existing account
2. You should see the FamilySwitcher in the home header
3. The first family you belonged to should be automatically active
4. Click the switcher to see all your families
5. Try switching between families - meals and plans should update

### 2. Test Creating Multiple Families

1. Click on the FamilySwitcher
2. Click "Create New Family"
3. Enter a name (e.g., "Test Family 2")
4. Submit
5. You should now be viewing the new family (empty meals/plans)
6. Switch back to your original family - your data should be there

### 3. Test Joining a Family

1. Get an invite code from another user:
   - Have them go to Profile → Family Settings
   - Copy their 8-character invite code
2. In your app, click FamilySwitcher
3. Click "Join with Code"
4. Enter the invite code
5. You should now be a member of that family
6. You should see their meals and plans

### 4. Test Onboarding

1. Sign out
2. Create a new account
3. Complete onboarding with a new family name
4. You should be logged in with the new family as active
5. Create some meals/plans
6. Create a second family via FamilySwitcher
7. Switch between families - data should be separate

### 5. Test Persistence

1. Select a specific family
2. Close the app completely
3. Reopen the app
4. The same family should still be active

## Verification Checklist

- [ ] AsyncStorage dependency installed
- [ ] App builds without errors
- [ ] FamilySwitcher appears in home header
- [ ] Can view list of all families
- [ ] Can switch between families
- [ ] Meals are filtered by active family
- [ ] Plans are filtered by active family
- [ ] Can create new family
- [ ] New family becomes active on creation
- [ ] Can join family with invite code
- [ ] Joined family becomes active
- [ ] Active family persists after app restart
- [ ] Onboarding sets first family as active
- [ ] No console errors or warnings

## Troubleshooting

### Issue: "AsyncStorage is not defined"

**Solution:** Make sure you've run `npm install` and rebuilt the native app.

### Issue: Family switcher doesn't appear

**Possible causes:**
1. User has no families - check database
2. Check console for errors in `useCurrentFamily` hook
3. Verify the component is imported in `HomeHeader`

### Issue: Switching families doesn't update data

**Possible causes:**
1. Check that `useMeals` and `usePlans` are using `familyId` from `useCurrentFamily`
2. Verify the `useEffect` dependencies in these hooks include `familyId`
3. Check console for API errors

### Issue: Active family resets on app restart

**Possible causes:**
1. AsyncStorage not properly configured
2. Check Zustand persist middleware setup
3. Verify storage key name is consistent

### Issue: "Cannot read property 'id' of null"

**Possible causes:**
1. No active family set - should auto-select first family
2. User has no families - check `NoFamilyPrompt` should show
3. Check `useCurrentFamily` initialization logic

## Database Verification

You can verify the multi-family setup in your database:

```sql
-- Check a user's family memberships
SELECT 
  f.id as family_id,
  f.name as family_name,
  fm.role,
  fm.permissions,
  fm.joined_at
FROM family_members fm
JOIN families f ON f.id = fm.family_id
WHERE fm.clerk_user_id = 'your_clerk_user_id'
ORDER BY fm.joined_at;

-- Check meals by family
SELECT 
  m.id,
  m.title,
  f.name as family_name
FROM meals m
JOIN families f ON f.id = m.family_id
WHERE f.id IN (
  SELECT family_id 
  FROM family_members 
  WHERE clerk_user_id = 'your_clerk_user_id'
);

-- Check plans by family
SELECT 
  wp.id,
  wp.name,
  f.name as family_name
FROM weekly_plans wp
JOIN families f ON f.id = wp.family_id
WHERE f.id IN (
  SELECT family_id 
  FROM family_members 
  WHERE clerk_user_id = 'your_clerk_user_id'
);
```

## Next Steps

Once the multi-family feature is working:

1. **Test edge cases:**
   - User with only one family
   - User with many families (10+)
   - Switching rapidly between families
   - Poor network conditions

2. **Consider enhancements:**
   - Add family avatars
   - Show family member count in switcher
   - Add recently used families quick access
   - Family search if many families

3. **Monitor performance:**
   - Check API response times with multiple families
   - Verify Zustand store doesn't cause re-renders
   - Test AsyncStorage read/write performance

4. **User feedback:**
   - Is the switcher easy to find?
   - Is the modal UX clear?
   - Do users understand the invite code system?

## Support

If you encounter issues not covered here:

1. Check the console logs for errors
2. Verify all files were updated correctly
3. Review [`MULTI_FAMILY_IMPLEMENTATION.md`](../implementations/MULTI_FAMILY_IMPLEMENTATION.md) for architecture details
4. Check that database schema matches expectations
5. Verify Supabase RLS policies allow multi-family access

## Files to Review

Key files for the multi-family feature:

- `lib/stores/activeFamilyStore.ts` - State management
- `hooks/useCurrentFamily.ts` - Main hook for family context
- `components/family/FamilySwitcher.tsx` - UI component
- `lib/api/families.ts` - API methods
- `hooks/useMeals.ts` & `hooks/usePlans.ts` - Data filtering

All of these files have been updated to support multiple families.

