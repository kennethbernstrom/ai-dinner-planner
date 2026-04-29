import { useState, useCallback, useEffect } from 'react'
import { createPlanSchema, updatePlanSchema, type CreatePlanInput, type UpdatePlanInput } from '@/lib/validation/schemas'
import { getWeekStartDate } from '@/lib/utils/date'
import { ZodError } from 'zod'

export interface PlanFormData {
  name: string
  weekStartDate: Date
  visibility: 'private' | 'shared'
}

export function usePlanForm(initialData?: Partial<PlanFormData>) {
  const [formData, setFormData] = useState<PlanFormData>({
    name: initialData?.name || '',
    weekStartDate: initialData?.weekStartDate || getWeekStartDate(),
    visibility: initialData?.visibility || 'private',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PlanFormData, string>>>({})

  // Update form data when initialData changes (e.g., when plan loads)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        weekStartDate: initialData.weekStartDate || getWeekStartDate(),
        visibility: initialData.visibility || 'private',
      })
    }
  }, [initialData?.name, initialData?.weekStartDate, initialData?.visibility])

  const updateField = useCallback(
    <K extends keyof PlanFormData>(field: K, value: PlanFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    [errors]
  )

  const validate = useCallback((isUpdate: boolean = false): boolean => {
    try {
      const schema = isUpdate ? updatePlanSchema : createPlanSchema
      const data = {
        name: formData.name.trim(),
        weekStartDate: formData.weekStartDate,
        visibility: formData.visibility,
      }
      
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof PlanFormData, string>> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof PlanFormData
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [formData])

  const toCreateInput = useCallback((): CreatePlanInput => {
    const data = {
      name: formData.name.trim(),
      weekStartDate: formData.weekStartDate,
      visibility: formData.visibility,
    }
    return createPlanSchema.parse(data)
  }, [formData])

  const toUpdateInput = useCallback((): UpdatePlanInput => {
    const data: any = {}
    if (formData.name.trim()) data.name = formData.name.trim()
    if (formData.weekStartDate) data.weekStartDate = formData.weekStartDate
    if (formData.visibility) data.visibility = formData.visibility
    
    return updatePlanSchema.parse(data)
  }, [formData])

  const reset = useCallback(() => {
    setFormData({
      name: '',
      weekStartDate: getWeekStartDate(),
      visibility: 'private',
    })
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    updateField,
    validate,
    toCreateInput,
    toUpdateInput,
    reset,
  }
}

