/**
 * Form validation helpers
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.trim().length <= maxLength
}

export function validateNumber(value: string | number, min?: number, max?: number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

