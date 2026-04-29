# Validation with Zod

This project uses [Zod](https://zod.dev/) for schema validation throughout the application. All form inputs, API requests, and data transformations are validated using Zod schemas.

## Schema Location

All validation schemas are defined in `lib/validation/schemas.ts`:

- `createMealSchema` / `updateMealSchema` - Meal creation and updates
- `createPlanSchema` / `updatePlanSchema` - Plan creation and updates
- `addMealToPlanSchema` / `updatePlanMealSchema` - Adding meals to plans
- `sharePlanSchema` - Sharing plans with users
- `registerPushTokenSchema` - Push notification token registration
- `onboardingSchema` - Onboarding data validation

## Usage

### In Form Hooks

Form hooks (`useMealForm`, `usePlanForm`) automatically validate data using Zod:

```typescript
const form = useMealForm()
const isValid = form.validate() // Uses Zod schema
const input = form.toCreateInput() // Returns validated Zod type
```

### In Components

Components can validate data before submission:

```typescript
import { createMealSchema } from '@/lib/validation/schemas'

try {
  const validated = createMealSchema.parse(formData)
  // Use validated data
} catch (error) {
  if (error instanceof ZodError) {
    // Handle validation errors
  }
}
```

### In API Clients

API clients validate input before sending requests:

```typescript
import { registerPushTokenSchema } from '@/lib/validation/schemas'

const validatedInput = registerPushTokenSchema.parse(input)
await api.post('/notifications/register', validatedInput)
```

## Type Safety

Zod schemas automatically generate TypeScript types:

```typescript
import type { CreateMealInput, UpdateMealInput } from '@/lib/validation/schemas'

// These types are inferred from Zod schemas
const meal: CreateMealInput = {
  title: "Spaghetti",
  // TypeScript will enforce schema constraints
}
```

## Validation Helpers

Use `lib/validation/helpers.ts` for common validation patterns:

```typescript
import { validateSchema, createValidationErrorResponse } from '@/lib/validation/helpers'

const result = validateSchema(createMealSchema, data)
if (!result.success) {
  return createValidationErrorResponse(result.errors)
}
```

## Benefits

1. **Type Safety**: Zod schemas generate TypeScript types automatically
2. **Runtime Validation**: Catch invalid data at runtime before it reaches the backend
3. **Consistent Validation**: Same schemas used in frontend and backend
4. **Better Error Messages**: Zod provides detailed, field-specific error messages
5. **Single Source of Truth**: Schema definitions in one place

