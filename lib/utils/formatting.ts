/**
 * Text formatting utilities
 */

export function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function formatTags(tags: string[] | null | undefined): string {
  if (!tags || tags.length === 0) return ''
  return tags.map(capitalizeFirst).join(', ')
}

