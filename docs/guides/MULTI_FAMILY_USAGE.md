# Multi-Family System - Developer Usage Guide

This guide provides quick reference examples for working with the multi-family system.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Common Patterns](#common-patterns)
3. [API Methods](#api-methods)
4. [Components](#components)
5. [Best Practices](#best-practices)

## Basic Usage

### Getting the Current Active Family

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

function MyComponent() {
  const { currentFamily, familyId, loading, error } = useCurrentFamily()
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!currentFamily) return <NoFamilyPrompt />
  
  return (
    <View>
      <Text>Active Family: {currentFamily.family.name}</Text>
      <Text>Your Role: {currentFamily.membership.role}</Text>
    </View>
  )
}
```

### Getting All Families

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

function FamilyList() {
  const { allFamilies, currentFamily, switchFamily } = useCurrentFamily()
  
  return (
    <FlatList
      data={allFamilies}
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => switchFamily(item.family.id)}
          className={currentFamily?.family.id === item.family.id ? 'bg-primary-50' : ''}
        >
          <Text>{item.family.name}</Text>
          <Text>{item.membership.role}</Text>
        </TouchableOpacity>
      )}
    />
  )
}
```

### Checking Permissions

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

function EditButton() {
  const { hasWritePermission, isAdmin } = useCurrentFamily()
  
  if (!hasWritePermission()) {
    return <Text>View Only</Text>
  }
  
  return (
    <Button 
      title={isAdmin() ? "Edit (Admin)" : "Edit"}
      onPress={handleEdit}
    />
  )
}
```

## Common Patterns

### Pattern 1: Scoped Data Fetching

When fetching data that should be scoped to the active family:

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { useMeals } from '@/hooks/useMeals'

function MealsList() {
  const { familyId, loading: familyLoading } = useCurrentFamily()
  const { meals, loading: mealsLoading } = useMeals()
  
  // useMeals automatically uses the active familyId
  // and will refetch when familyId changes
  
  if (familyLoading || mealsLoading) return <LoadingSpinner />
  
  return (
    <FlatList
      data={meals}
      renderItem={({ item }) => <MealCard meal={item} />}
    />
  )
}
```

### Pattern 2: Creating Resources with Family Context

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { useMeals } from '@/hooks/useMeals'

function CreateMealForm() {
  const { familyId, hasWritePermission } = useCurrentFamily()
  const { createMeal, loading } = useMeals()
  
  const handleSubmit = async (data: CreateMealInput) => {
    if (!hasWritePermission()) {
      Alert.alert('Error', 'You do not have permission to create meals')
      return
    }
    
    // familyId is automatically included by useMeals
    const result = await createMeal(data)
    if (result.data) {
      Alert.alert('Success', 'Meal created!')
    }
  }
  
  return <MealForm onSubmit={handleSubmit} loading={loading} />
}
```

### Pattern 3: Switching Families Programmatically

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { useEffect } from 'react'

function AutoSwitchFamily({ targetFamilyId }: { targetFamilyId: number }) {
  const { currentFamily, switchFamily } = useCurrentFamily()
  
  useEffect(() => {
    if (currentFamily?.family.id !== targetFamilyId) {
      switchFamily(targetFamilyId)
    }
  }, [targetFamilyId, currentFamily, switchFamily])
  
  return null
}
```

### Pattern 4: Conditional Rendering Based on Family

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

function FamilySpecificFeature() {
  const { currentFamily, allFamilies } = useCurrentFamily()
  
  // Show different content based on family count
  if (allFamilies.length === 0) {
    return <CreateYourFirstFamily />
  }
  
  if (allFamilies.length === 1) {
    return <SingleFamilyView />
  }
  
  return <MultiFamilyView />
}
```

### Pattern 5: Direct Store Access (Advanced)

For cases where you need the active family ID without the full hook:

```typescript
import { useActiveFamilyStore } from '@/lib/stores'

function QuickFamilyCheck() {
  const activeFamilyId = useActiveFamilyStore((state) => state.activeFamilyId)
  
  if (!activeFamilyId) {
    return <NoFamilySelected />
  }
  
  return <Content familyId={activeFamilyId} />
}
```

## API Methods

### Family Management

```typescript
import { useFamilies } from '@/hooks/useFamilies'

function FamilyManagement() {
  const {
    createFamily,
    joinFamily,
    getAllFamilies,
    getFamily,
    getMembers,
    updateMember,
    removeMember,
    leaveFamily,
    regenerateInviteCode,
    loading,
    error
  } = useFamilies()
  
  // Create a new family
  const handleCreate = async () => {
    const family = await createFamily({ name: 'My New Family' })
    if (family) {
      console.log('Created:', family)
    }
  }
  
  // Join existing family
  const handleJoin = async () => {
    const member = await joinFamily({ inviteCode: 'ABC12345' })
    if (member) {
      console.log('Joined family:', member.familyId)
    }
  }
  
  // Get all families
  const handleGetAll = async () => {
    const families = await getAllFamilies()
    if (families) {
      console.log('My families:', families)
    }
  }
  
  // Update a member's permissions
  const handleUpdateMember = async (familyId: number, memberId: number) => {
    const updated = await updateMember(familyId, memberId, {
      permissions: 'write'
    })
    if (updated) {
      console.log('Updated member:', updated)
    }
  }
  
  // Leave a family
  const handleLeave = async (familyId: number) => {
    const success = await leaveFamily(familyId)
    if (success) {
      console.log('Left family')
    }
  }
  
  return <View>...</View>
}
```

### Direct API Usage (Without Hooks)

```typescript
import { useFamiliesApi } from '@/lib/api/families'
import { useAuth } from '@clerk/clerk-expo'

function DirectApiExample() {
  const { userId } = useAuth()
  const api = useFamiliesApi()
  
  const fetchData = async () => {
    try {
      // Get all families
      const families = await api.getAllUserFamilies()
      
      // Get specific family
      const family = await api.getCurrentUserFamily(1)
      
      // Get family details
      const familyDetails = await api.getFamilyById(1)
      
      // Get members
      const members = await api.getFamilyMembers(1)
      
    } catch (error) {
      console.error('API error:', error)
    }
  }
  
  return <View>...</View>
}
```

## Components

### FamilySwitcher

The main UI component for switching families:

```typescript
import { FamilySwitcher } from '@/components/family/FamilySwitcher'

// Basic usage
<FamilySwitcher />

// With custom styling
<FamilySwitcher className="mb-4" />

// With label
<FamilySwitcher showLabel={true} />
```

### CreateFamilyForm

```typescript
import { CreateFamilyForm } from '@/components/family/CreateFamilyForm'

function CreateModal() {
  const [visible, setVisible] = useState(false)
  
  return (
    <Modal visible={visible}>
      <CreateFamilyForm
        onSuccess={() => {
          setVisible(false)
          // Family is automatically set as active
        }}
        onCancel={() => setVisible(false)}
      />
    </Modal>
  )
}
```

### JoinFamilyForm

```typescript
import { JoinFamilyForm } from '@/components/family/JoinFamilyForm'

function JoinModal() {
  const [visible, setVisible] = useState(false)
  
  return (
    <Modal visible={visible}>
      <JoinFamilyForm
        onSuccess={() => {
          setVisible(false)
          // Joined family is automatically set as active
        }}
        onCancel={() => setVisible(false)}
      />
    </Modal>
  )
}
```

## Best Practices

### 1. Always Check for Active Family

```typescript
// ✅ Good
function MyComponent() {
  const { currentFamily, familyId } = useCurrentFamily()
  
  if (!currentFamily || !familyId) {
    return <NoFamilyPrompt />
  }
  
  return <Content familyId={familyId} />
}

// ❌ Bad - might crash if no family
function MyComponent() {
  const { familyId } = useCurrentFamily()
  return <Content familyId={familyId} /> // familyId could be undefined!
}
```

### 2. Use Existing Hooks for Data Fetching

```typescript
// ✅ Good - uses existing hooks that handle family context
function MealsList() {
  const { meals } = useMeals()
  return <List data={meals} />
}

// ❌ Bad - bypassing the family-aware hooks
function MealsList() {
  const { familyId } = useCurrentFamily()
  const [meals, setMeals] = useState([])
  
  useEffect(() => {
    // Don't manually fetch like this
    fetchMealsForFamily(familyId).then(setMeals)
  }, [familyId])
  
  return <List data={meals} />
}
```

### 3. Handle Permission Checks

```typescript
// ✅ Good
function EditButton() {
  const { hasWritePermission } = useCurrentFamily()
  
  if (!hasWritePermission()) {
    return null // or show disabled state
  }
  
  return <Button onPress={handleEdit} />
}

// ❌ Bad - allowing actions without permission check
function EditButton() {
  return <Button onPress={handleEdit} />
}
```

### 4. Refresh Data After Family Switch

```typescript
// ✅ Good - hooks automatically handle this
function MealsList() {
  const { meals } = useMeals() // Auto-refetches on family change
  return <List data={meals} />
}

// If you need custom refresh logic:
function CustomComponent() {
  const { familyId } = useCurrentFamily()
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetchCustomData(familyId).then(setData)
  }, [familyId]) // ✅ Include familyId in dependencies
  
  return <Content data={data} />
}
```

### 5. Set Active Family After Creation/Join

```typescript
// ✅ Good - already handled in CreateFamilyForm and JoinFamilyForm
// But if you're creating your own flow:

import { useActiveFamilyStore } from '@/lib/stores'

const setActiveFamilyId = useActiveFamilyStore((state) => state.setActiveFamilyId)

const handleCreateFamily = async (name: string) => {
  const family = await createFamily({ name })
  if (family) {
    setActiveFamilyId(family.id) // ✅ Set as active
  }
}
```

### 6. Clear Active Family on Sign Out

The active family is stored persistently, so consider clearing it on sign out:

```typescript
import { useActiveFamilyStore } from '@/lib/stores'

function SignOutButton() {
  const clearActiveFamilyId = useActiveFamilyStore((state) => state.clearActiveFamilyId)
  
  const handleSignOut = async () => {
    clearActiveFamilyId() // Clear before signing out
    await signOut()
  }
  
  return <Button onPress={handleSignOut} title="Sign Out" />
}
```

### 7. Loading States

```typescript
// ✅ Good - handle all loading states
function MyComponent() {
  const { currentFamily, loading: familyLoading } = useCurrentFamily()
  const { meals, loading: mealsLoading } = useMeals()
  
  if (familyLoading) return <LoadingSpinner message="Loading family..." />
  if (!currentFamily) return <NoFamilyPrompt />
  if (mealsLoading) return <LoadingSpinner message="Loading meals..." />
  
  return <MealsList meals={meals} />
}
```

## Type Definitions

Reference types when working with the multi-family system:

```typescript
import type { 
  Family, 
  FamilyMember, 
  FamilyWithMembers, 
  CurrentUserFamily 
} from '@/types/family'

// Family - basic family info
interface Family {
  id: number
  name: string
  inviteCode: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// FamilyMember - membership info
interface FamilyMember {
  id: number
  familyId: number
  clerkUserId: string
  role: 'admin' | 'member'
  permissions: 'read' | 'write'
  joinedAt: Date
}

// FamilyWithMembers - family + all members
interface FamilyWithMembers extends Family {
  members: FamilyMember[]
}

// CurrentUserFamily - user's view of a family
interface CurrentUserFamily {
  family: Family
  membership: FamilyMember
}
```

## Debugging Tips

### Check Active Family

```typescript
import { useActiveFamilyStore } from '@/lib/stores'

// In any component or hook
const activeFamilyId = useActiveFamilyStore.getState().activeFamilyId
console.log('Active Family ID:', activeFamilyId)
```

### Check All Families

```typescript
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

const { allFamilies, currentFamily } = useCurrentFamily()
console.log('All families:', allFamilies)
console.log('Current family:', currentFamily)
```

### Monitor Family Switches

```typescript
import { useEffect } from 'react'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'

function DebugComponent() {
  const { familyId } = useCurrentFamily()
  
  useEffect(() => {
    console.log('Active family changed to:', familyId)
  }, [familyId])
  
  return null
}
```

## Summary

The multi-family system is designed to be:
- **Automatic**: Data is filtered by active family without manual intervention
- **Persistent**: Active family selection survives app restarts
- **Type-safe**: Full TypeScript support
- **Hook-based**: Easy to integrate into any component
- **Flexible**: Supports multiple usage patterns

For more details, see:
- [`MULTI_FAMILY_IMPLEMENTATION.md`](../implementations/MULTI_FAMILY_IMPLEMENTATION.md) — Architecture details
- [`MULTI_FAMILY_SETUP.md`](../setup/MULTI_FAMILY_SETUP.md) — Setup and testing guide

