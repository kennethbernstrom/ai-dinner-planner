# Supabase Storage with Clerk Authentication Setup

This guide explains how to set up Supabase Storage to work with Clerk authentication for image uploads.

## The Challenge

You're using **Clerk** for user authentication, but **Supabase** has its own authentication system. Supabase's Row Level Security (RLS) policies use `auth.uid()` which refers to Supabase's auth, not Clerk's. This causes the "violates row-level security policy" error.

## Solution Options

### Option 1: Simple RLS Policies (Quick Setup) ⚡

**Best for:** Development, MVPs, or when you trust your application security.

#### Step 1: Create the Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Settings:
   - Name: `meal-images`
   - Public: ✅ **Enable** (allows public read access to images)
4. Click **"Create bucket"**

#### Step 2: Apply Simple RLS Policies

Go to **SQL Editor** and run:

```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Allow uploads to meal-images bucket (public access)
CREATE POLICY "Allow uploads to meal-images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'meal-images');

-- Allow public read access
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
```

**Pros:**
- ✅ Quick setup (5 minutes)
- ✅ No additional Clerk configuration needed
- ✅ Works immediately

**Cons:**
- ⚠️ Less secure - anyone with your anon key can upload
- ⚠️ No user-level access control in database

---

### Option 2: Clerk JWT Integration (Production-Ready) 🔒

**Best for:** Production apps requiring proper user-level access control.

#### Step 1: Configure Clerk JWT Template

1. Go to **Clerk Dashboard** → **JWT Templates**
2. Click **"New template"** → Select **"Supabase"**
3. Name: `supabase`
4. The template should include:
   ```json
   {
     "aud": "authenticated",
     "exp": {{user.session_expiration}},
     "iat": {{user.session_created_at}},
     "iss": "{{env.clerk_instance_url}}",
     "sub": "{{user.id}}"
   }
   ```
5. Save the template

#### Step 2: Configure Supabase JWT Verification

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Scroll to **JWT Settings**
3. Copy your **JWT Secret**
4. Go to **Clerk Dashboard** → **JWT Templates** → Edit your `supabase` template
5. Under **"Custom signing key"** paste your Supabase JWT secret
6. Save changes

#### Step 3: Update Supabase RLS Policies

In **Supabase SQL Editor**, run:

```sql
-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'meal-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meal-images' AND
  (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

#### Step 4: Code Already Updated! ✅

The code has been updated to:
- Get Clerk's JWT token using `getToken({ template: 'supabase' })`
- Create an authenticated Supabase client with the token
- Use that client for storage operations

**Pros:**
- ✅ Secure - proper user-level access control
- ✅ Users can only access their own images
- ✅ Production-ready
- ✅ Follows security best practices

**Cons:**
- ⏱️ Requires additional Clerk configuration
- 🔧 More complex setup

---

## Current Implementation Status

✅ **Code is ready** - supports both approaches
✅ **ImagePicker deprecation fixed** - now uses `['images']` instead of `MediaTypeOptions.Images`
✅ **Clerk JWT integration implemented** - automatically gets token when uploading

## Testing the Upload

1. **Choose your approach** (Simple or JWT Integration)
2. **Apply the corresponding SQL policies** in Supabase
3. **For JWT Integration:** Complete Clerk JWT template setup
4. **Test:**
   - Create or edit a meal
   - Tap "Add Image"
   - Select from camera or library
   - Image should display in form
   - Submit the form
   - ✅ Image should upload successfully!

## Troubleshooting

### Error: "new row violates row-level security policy"
- **Solution:** Apply the RLS policies from your chosen option above

### Error: "Failed to get authentication token"
- **Cause:** Clerk JWT template not configured
- **Solution:** Either use Option 1 (Simple) or complete Option 2 Clerk setup

### Upload works but images don't display
- **Check:** Ensure bucket is marked as "public" in Supabase
- **Check:** Public read policy is applied

### Images upload to wrong folder
- **Check:** File path uses `${userId}/` prefix
- **Check:** Clerk `userId` is available

---

## Recommendation

**For Development/Testing:** Start with **Option 1 (Simple)** - get it working quickly

**Before Production:** Upgrade to **Option 2 (JWT Integration)** - proper security

---

## Questions?

- Clerk JWT Templates: https://clerk.com/docs/backend-requests/making/jwt-templates
- Supabase Storage RLS: https://supabase.com/docs/guides/storage/security/access-control

