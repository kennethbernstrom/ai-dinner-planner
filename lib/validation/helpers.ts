import { ZodError, ZodSchema } from 'zod'
import { ApiResponse } from '@/types/api'

/**
 * Validate data against a Zod schema and return formatted errors
 */
export function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return {
        success: false,
        error: 'Validation failed',
        errors,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
      errors: {},
    }
  }
}

/**
 * Create an API error response from validation errors
 */
export function createValidationErrorResponse(
  errors: Record<string, string>
): ApiResponse<never> {
  const errorMessages = Object.values(errors)
  return {
    error: errorMessages.length > 0 ? errorMessages[0] : 'Validation failed',
    message: errorMessages.join(', '),
  }
}

