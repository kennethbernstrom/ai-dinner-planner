import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImagePicker } from '@/components/ui/ImagePicker'
import { IconButton } from '@/components/ui/IconButton'
import { useMealForm } from '@/hooks/useMealForm'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Meal } from '@/types/meal'
import { Ionicons } from '@expo/vector-icons'

export interface MealFormProps {
  meal?: Meal
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function MealForm({ meal, onSubmit, onCancel, loading = false }: MealFormProps) {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(meal?.imageUrl || null)
  const [imageNeedsUpload, setImageNeedsUpload] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const { uploadImage, uploading, error: uploadError } = useImageUpload()
  
  const form = useMealForm(
    meal
      ? {
          title: meal.title,
          description: meal.description || '',
          instructions: meal.instructions || '',
          tags: meal.tags || [],
          sourceUrl: meal.sourceUrl || '',
          imageUrl: meal.imageUrl || null,
        }
      : undefined,
    meal?.ingredients || undefined
  )

  const handleSubmit = async () => {
    if (!form.validate()) {
      console.log(form.errors)
      return
    }

    let imageUrl = form.formData.imageUrl

    // If a new image was selected, upload it first
    if (imageNeedsUpload && selectedImageUri) {
      const uploadedUrl = await uploadImage(selectedImageUri)
      if (!uploadedUrl) {
        Alert.alert('Error', uploadError || 'Failed to upload image')
        return
      }
      imageUrl = uploadedUrl
    }

    // Update form data with the image URL
    form.updateField('imageUrl', imageUrl || '')

    const input = meal ? form.toUpdateInput() : form.toCreateInput()
    
    // Add imageUrl to input if we have one
    if (imageUrl) {
      (input as any).imageUrl = imageUrl
    }

    await onSubmit(input)
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 border-b border-neutral-200 bg-white">
        <View className="flex-row items-center">
          {onCancel && (
            <TouchableOpacity onPress={onCancel} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#171717" />
            </TouchableOpacity>
          )}
          <Text className="text-2xl font-bold text-neutral-900" numberOfLines={1}>
            {meal ? 'Edit Meal' : 'New Meal'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ paddingBottom: 120, width: '100%' }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={true}
        alwaysBounceHorizontal={false}
        nestedScrollEnabled={false}
      >
        {/* Image Section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, width: '100%' }}>
          <ImagePicker
            imageUri={selectedImageUri}
            onImageSelected={(uri: string) => {
              setSelectedImageUri(uri)
              setImageNeedsUpload(true)
            }}
            onImageRemoved={() => {
              setSelectedImageUri(null)
              form.updateField('imageUrl', '')
              setImageNeedsUpload(false)
            }}
          />
        </View>

        {/* Basic Info Section */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, width: '100%' }} className="bg-neutral-50">
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Basic Information
          </Text>

          <Input
            label="Title *"
            value={form.formData.title}
            onChangeText={(text) => form.updateField('title', text)}
            placeholder="e.g., Spaghetti Bolognese"
            error={form.errors.title}
            className="mb-3"
          />

          <Input
            label="Description"
            value={form.formData.description}
            onChangeText={(text) => form.updateField('description', text)}
            placeholder="A brief description of the meal"
            multiline
            numberOfLines={3}
            className="mb-0"
          />
        </View>

        {/* Instructions Section */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, width: '100%' }}>
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Instructions & Notes
          </Text>
          <Input
            value={form.formData.instructions}
            onChangeText={(text) => form.updateField('instructions', text)}
            placeholder="Cooking instructions, preparation notes, or tips..."
            multiline
            numberOfLines={5}
            className="mb-0"
          />
        </View>

      {/* Tags Section */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, width: '100%' }} className="bg-neutral-50">
        <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Tags
        </Text>
        
        {/* Display existing tags */}
        {form.formData.tags.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {form.formData.tags.map((tag, index) => (
              <View key={index} className="flex-row items-center bg-primary-100 rounded-full px-3 py-1.5">
                <Text className="text-primary-700 text-sm font-medium mr-1" numberOfLines={1}>{tag}</Text>
                <TouchableOpacity
                  onPress={() => form.removeTag(index)}
                  className="ml-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#c2410c" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add tag input */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Input
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="e.g., vegetarian, quick"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              if (tagInput.trim()) {
                form.addTag(tagInput)
                setTagInput('')
              }
            }}
            disabled={!tagInput.trim() || form.formData.tags.length >= 10}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: !tagInput.trim() || form.formData.tags.length >= 10 ? '#e5e5e5' : '#ea580c',
              minWidth: 44,
            }}
          >
            <Ionicons 
              name="add" 
              size={24} 
              color={!tagInput.trim() || form.formData.tags.length >= 10 ? '#9ca3af' : '#ffffff'} 
            />
          </TouchableOpacity>
        </View>
        
        {form.formData.tags.length >= 10 && (
          <Text className="text-xs text-amber-600 mt-1">Maximum 10 tags reached</Text>
        )}
        {form.errors.tags && (
          <Text className="text-xs text-red-600 mt-1">{form.errors.tags}</Text>
        )}
      </View>

      {/* Ingredients Section */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, width: '100%' }}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Ingredients
          </Text>
          <TouchableOpacity
            onPress={form.addIngredient}
            className="flex-row items-center px-3 py-1.5 bg-primary-500 rounded-lg"
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text className="text-white font-semibold ml-1 text-sm">Add Ingredient</Text>
          </TouchableOpacity>
        </View>

        {form.formData.ingredients.length === 0 ? (
          <View className="py-8 items-center">
            <Ionicons name="fast-food-outline" size={48} color="#d4d4d4" />
            <Text className="text-sm text-neutral-500 mt-2">No ingredients added yet</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {form.formData.ingredients.map((ingredient, index) => (
              <View key={index} className="border border-neutral-200 rounded-xl p-4 bg-white shadow-sm">
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Input
                      label="Ingredient Name *"
                      value={ingredient.name}
                      onChangeText={(text) => form.updateIngredient(index, 'name', text)}
                      placeholder="e.g., Olive Oil"
                      className="mb-0"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => form.removeIngredient(index)}
                    style={{
                      marginTop: 28,
                      padding: 8,
                      backgroundColor: '#fef2f2',
                      borderRadius: 8,
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Input
                      label="Quantity"
                      value={ingredient.quantity || ''}
                      onChangeText={(text) => form.updateIngredient(index, 'quantity', text || null)}
                      placeholder="2"
                      className="mb-0"
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Input
                      label="Unit"
                      value={ingredient.unit || ''}
                      onChangeText={(text) => form.updateIngredient(index, 'unit', text || null)}
                      placeholder="tbsp"
                      className="mb-0"
                    />
                  </View>
                </View>
                <Input
                  label="Category (optional)"
                  value={ingredient.category || ''}
                  onChangeText={(text) => form.updateIngredient(index, 'category', text || null)}
                  placeholder="e.g., Spices"
                  className="mb-0"
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Recipe URL Section */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, width: '100%' }} className="bg-neutral-50">
        <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Recipe Source
        </Text>
        <Input
          value={form.formData.sourceUrl}
          onChangeText={(text) => form.updateField('sourceUrl', text)}
          placeholder="https://example.com/recipe"
          autoCapitalize="none"
          className="mb-0"
        />
      </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="px-6 pt-4 pb-12 w-full bg-white border-t border-neutral-200">
        <Button
          title={meal ? 'Update Meal' : 'Create Meal'}
          onPress={handleSubmit}
          loading={loading || uploading}
          variant="primary"
          size="lg"
        />
      </View>
    </View>
  )
}
