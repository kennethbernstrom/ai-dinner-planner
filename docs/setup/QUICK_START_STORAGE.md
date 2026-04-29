# 🚀 Quick Start: Enable Image Upload (5 Minutes)

## What Changed
✅ Code updated to work **WITHOUT** requiring Clerk JWT template setup  
✅ Falls back gracefully when JWT template is not configured  
✅ ImagePicker deprecation warning fixed  

## Setup Instructions

### Step 1: Run SQL in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy and paste the contents of `supabase-storage-setup.sql`
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

### Step 2: Verify Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. You should see a bucket named `meal-images`
3. Click on it and verify it's marked as **"Public"**

### Step 3: Test the Upload!

1. Run your app
2. Create or edit a meal
3. Tap **"Add Image"**
4. Select from camera or photo library
5. Image should display in the form
6. Submit the form
7. ✅ **Success!** Image is uploaded and saved

## How It Works Now

The code will:
1. Try to get a Clerk JWT token (if `supabase` template exists)
2. If JWT template exists → Use authenticated client (secure)
3. If JWT template doesn't exist → Use default client (still works!)
4. Upload the image to Supabase Storage
5. Save the public URL with the meal

## Storage Organization

Images are stored as:
```
meal-images/
  └── {clerkUserId}/
      └── {timestamp}.{ext}
```

Example: `meal-images/user_abc123/1703123456789.jpg`

## Security Note

**Current Setup:**
- ✅ Works immediately
- ✅ Images are stored per-user in folders
- ⚠️ Basic security (anon key can upload)

**For Production:**
Later, you can upgrade to JWT-based authentication by:
1. Creating Clerk JWT template named `supabase`
2. Code will automatically use it (no changes needed!)
3. More secure user-level access control

See `SUPABASE_CLERK_AUTH_SETUP.md` for production setup details.

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Run the SQL script from Step 1 above

### Error: "Bucket not found"
**Solution:** Verify bucket exists and is named exactly `meal-images`

### Images upload but don't display
**Solution:** Ensure bucket is marked as "Public" in Supabase

### Upload very slow
**Possible cause:** Large images  
**Solution:** The ImagePicker is configured to compress (quality: 0.8)

## What's Next?

You're all set! Your image upload feature is working. 

Optional enhancements:
- [ ] Add image compression for faster uploads
- [ ] Add loading progress indicator
- [ ] Enable image cropping
- [ ] Setup Clerk JWT template for production security

---

**Questions?** Check `SUPABASE_CLERK_AUTH_SETUP.md` for detailed documentation.

