-- =====================================================
-- Supabase Storage Setup for Meal Images
-- Simple RLS Policies (No JWT Template Required)
-- =====================================================

-- Step 1: Create storage bucket (if not already created via UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to meal-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from meal-images" ON storage.objects;

-- Step 3: Create simple RLS policies

-- Allow uploads to meal-images bucket
CREATE POLICY "Allow uploads to meal-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'meal-images');

-- Allow public read access (so images can be viewed)
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'meal-images');

-- Allow deletes from meal-images bucket
CREATE POLICY "Allow deletes from meal-images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'meal-images');

-- Step 4: Verify policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- ✅ Done! Your storage is now ready for image uploads.

