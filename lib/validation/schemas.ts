import { z } from 'zod'

// Ingredient schema
export const mealIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required').max(100, 'Ingredient name must be less than 100 characters'),
  quantity: z.string().max(50, 'Quantity must be less than 50 characters').optional().nullable(),
  unit: z.string().max(50, 'Unit must be less than 50 characters').optional().nullable(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional().nullable(),
})

export type MealIngredientInput = z.infer<typeof mealIngredientSchema>

// Meal schemas
export const createMealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  instructions: z.string().max(2000, 'Instructions must be less than 2000 characters').optional().nullable(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional().nullable(),
  sourceUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().nullable(),
  ingredients: z.array(mealIngredientSchema).max(50, 'Maximum 50 ingredients allowed').optional().nullable(),
})

export const updateMealSchema = createMealSchema.partial().extend({
  imageUrl: z.string().url('Must be a valid URL').optional().nullable(),
})

export type CreateMealInput = z.infer<typeof createMealSchema>
export type UpdateMealInput = z.infer<typeof updateMealSchema>

// Plan schemas
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100, 'Plan name must be less than 100 characters'),
  weekStartDate: z.coerce.date({
    required_error: 'Week start date is required',
    invalid_type_error: 'Invalid date format',
  }),
  visibility: z.enum(['private', 'shared']).default('private'),
})

export const updatePlanSchema = createPlanSchema.partial()

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>

// Plan Meal schemas
export const addMealToPlanSchema = z.object({
  mealId: z.number().int().positive('Invalid meal ID'),
  dayOfWeek: z.number().int().min(0, 'Day must be between 0-6').max(6, 'Day must be between 0-6').optional().nullable(),
  mealSlot: z.enum(['breakfast', 'lunch', 'dinner']).default('dinner'),
})

export const updatePlanMealSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  mealSlot: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
})

export type AddMealToPlanInput = z.infer<typeof addMealToPlanSchema>
export type UpdatePlanMealInput = z.infer<typeof updatePlanMealSchema>

// Sharing schemas
export const sharePlanSchema = z.object({
  clerkUserId: z.string().optional(),
  email: z.string().email('Must be a valid email address').optional(),
  role: z.enum(['editor', 'viewer']).default('viewer'),
}).refine(
  (data) => data.clerkUserId || data.email,
  {
    message: 'Either clerkUserId or email must be provided',
  }
)

export type SharePlanInput = z.infer<typeof sharePlanSchema>

// Notification schemas
export const registerPushTokenSchema = z.object({
  expoPushToken: z.string().min(1, 'Push token is required'),
  deviceId: z.string().optional().nullable(),
})

export type PushTokenRegistration = z.infer<typeof registerPushTokenSchema>

// Family schemas
export const createFamilySchema = z.object({
  name: z.string().min(2, 'Family name must be at least 2 characters').max(100, 'Family name must be less than 100 characters'),
})

export const joinFamilySchema = z.object({
  inviteCode: z.string().length(8, 'Invite code must be 8 characters'),
})

export const updateFamilyMemberSchema = z.object({
  permissions: z.enum(['read', 'write']).optional(),
  role: z.enum(['admin', 'member']).optional(),
})

export type CreateFamilyInput = z.infer<typeof createFamilySchema>
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>
export type UpdateFamilyMemberInput = z.infer<typeof updateFamilyMemberSchema>

// Onboarding schemas
export const onboardingSchema = z.object({
  dietaryPreferences: z.array(z.string()).default([]),
  householdSize: z.number().int().min(1, 'Household size must be at least 1').max(20, 'Household size must be less than 20'),
  familyName: z.string().min(2, 'Family name must be at least 2 characters').max(100, 'Family name must be less than 100 characters'),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

