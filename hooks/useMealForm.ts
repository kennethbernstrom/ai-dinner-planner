import { useState, useCallback } from 'react'
import { createMealSchema, updateMealSchema, type CreateMealInput, type UpdateMealInput, type MealIngredientInput } from '@/lib/validation/schemas'
import { ZodError } from 'zod'
import { MealIngredient } from '@/types/meal'

export interface MealFormData {
  title: string
  description: string
  instructions: string
  tags: string[]
  sourceUrl: string
  imageUrl: string | null
  ingredients: MealIngredientInput[]
}

export function useMealForm(initialData?: Partial<MealFormData>, initialIngredients?: MealIngredient[]) {
  const [formData, setFormData] = useState<MealFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructions: initialData?.instructions || '',
    tags: initialData?.tags || [],
    sourceUrl: initialData?.sourceUrl || '',
    imageUrl: initialData?.imageUrl || null,
    ingredients: initialIngredients?.map(ing => ({
      name: ing.name,
      quantity: ing.quantity || null,
      unit: ing.unit || null,
      category: ing.category || null,
    })) || [],
  })

  const [errors, setErrors] = useState<Partial<Record<keyof MealFormData, string>>>({})

  const updateField = useCallback((field: keyof MealFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const addIngredient = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: null, unit: null, category: null }],
    }))
  }, [])

  const removeIngredient = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }, [])

  const updateIngredient = useCallback((index: number, field: keyof MealIngredientInput, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }))
  }, [])

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
    }
  }, [formData.tags])

  const removeTag = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }, [])

  const validate = useCallback((isUpdate: boolean = false): boolean => {
    try {
      const schema = isUpdate ? updateMealSchema : createMealSchema
      const data = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        instructions: formData.instructions.trim() || null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        sourceUrl: formData.sourceUrl.trim() || null,
        ingredients: formData.ingredients.length > 0 ? formData.ingredients.filter(ing => ing.name.trim()) : null,
      }
      
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof MealFormData, string>> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof MealFormData
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [formData])

  const toCreateInput = useCallback((): CreateMealInput => {
    const data = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      instructions: formData.instructions.trim() || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      sourceUrl: formData.sourceUrl.trim() || null,
      imageUrl: formData.imageUrl || null,
      ingredients: formData.ingredients.length > 0 
        ? formData.ingredients
            .filter(ing => ing.name.trim())
            .map(ing => ({
              name: ing.name.trim(),
              quantity: ing.quantity?.trim() || null,
              unit: ing.unit?.trim() || null,
              category: ing.category?.trim() || null,
            }))
        : null,
    }
    return createMealSchema.parse(data)
  }, [formData])

  const toUpdateInput = useCallback((): UpdateMealInput => {
    const data: any = {}
    if (formData.title.trim()) data.title = formData.title.trim()
    if (formData.description.trim()) data.description = formData.description.trim()
    if (formData.instructions.trim()) data.instructions = formData.instructions.trim()
    if (formData.tags.length > 0) data.tags = formData.tags
    if (formData.sourceUrl.trim()) data.sourceUrl = formData.sourceUrl.trim()
    if (formData.imageUrl) data.imageUrl = formData.imageUrl
    if (formData.ingredients.length > 0) {
      data.ingredients = formData.ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity?.trim() || null,
          unit: ing.unit?.trim() || null,
          category: ing.category?.trim() || null,
        }))
    }
    
    return updateMealSchema.parse(data)
  }, [formData])

  const reset = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      tags: [],
      sourceUrl: '',
      imageUrl: null,
      ingredients: [],
    })
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    updateField,
    addIngredient,
    removeIngredient,
    updateIngredient,
    addTag,
    removeTag,
    validate,
    toCreateInput,
    toUpdateInput,
    reset,
  }
}

