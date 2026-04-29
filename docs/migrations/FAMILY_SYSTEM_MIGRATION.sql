-- Migration SQL for adding Family System
-- This file contains the SQL commands needed to update your database schema

-- Step 1: Create the families table
CREATE TABLE families (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for families table
CREATE INDEX idx_families_invite_code ON families(invite_code);
CREATE INDEX idx_families_created_by ON families(created_by);

-- Step 2: Create the family_members table
CREATE TABLE family_members (
  id SERIAL PRIMARY KEY,
  family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  clerk_user_id VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  permissions VARCHAR(10) NOT NULL DEFAULT 'read' CHECK (permissions IN ('read', 'write')),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(family_id, clerk_user_id)
);

-- Create indexes for family_members table
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_clerk_user_id ON family_members(clerk_user_id);

-- Step 3: Add family_id to meals table
-- Note: This assumes you don't have critical data. For production, you'd need a more careful migration.
ALTER TABLE meals ADD COLUMN family_id INTEGER REFERENCES families(id) ON DELETE CASCADE;

-- Create index for family_id in meals
CREATE INDEX idx_meals_family_id ON meals(family_id);

-- Step 4: Add family_id to weekly_plans table
ALTER TABLE weekly_plans ADD COLUMN family_id INTEGER REFERENCES families(id) ON DELETE CASCADE;

-- Create index for family_id in weekly_plans
CREATE INDEX idx_weekly_plans_family_id ON weekly_plans(family_id);

-- Step 5: For existing data migration (if you have existing data)
-- You would need to:
-- 1. Create a default family for each user
-- 2. Add each user as an admin member of their family
-- 3. Update all their meals and plans to reference their family
-- This is commented out as it depends on your specific data

-- Example migration for existing data:
/*
-- Create families for existing users and migrate their data
DO $$
DECLARE
  user_record RECORD;
  new_family_id INTEGER;
  random_code VARCHAR(8);
BEGIN
  FOR user_record IN SELECT DISTINCT clerk_user_id FROM meals
  LOOP
    -- Generate a random invite code
    random_code := upper(substr(md5(random()::text), 1, 8));
    
    -- Create family for this user
    INSERT INTO families (name, invite_code, created_by)
    VALUES (user_record.clerk_user_id || '''s Family', random_code, user_record.clerk_user_id)
    RETURNING id INTO new_family_id;
    
    -- Add user as admin member
    INSERT INTO family_members (family_id, clerk_user_id, role, permissions)
    VALUES (new_family_id, user_record.clerk_user_id, 'admin', 'write');
    
    -- Update user's meals
    UPDATE meals
    SET family_id = new_family_id
    WHERE clerk_user_id = user_record.clerk_user_id;
    
    -- Update user's plans
    UPDATE weekly_plans
    SET family_id = new_family_id
    WHERE clerk_user_id = user_record.clerk_user_id;
  END LOOP;
END $$;

-- After migration, make family_id NOT NULL
ALTER TABLE meals ALTER COLUMN family_id SET NOT NULL;
ALTER TABLE weekly_plans ALTER COLUMN family_id SET NOT NULL;
*/

-- Step 6: Update your Row Level Security (RLS) policies if using Supabase
-- This ensures users can only access data from families they belong to

-- Enable RLS on new tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Policies for families table
CREATE POLICY "Users can view families they are members of"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update families they admin"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for family_members table
CREATE POLICY "Users can view members of their families"
  ON family_members FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage family members"
  ON family_members FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update policies for meals table (replace existing policies)
DROP POLICY IF EXISTS "Users can view their own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert their own meals" ON meals;
DROP POLICY IF EXISTS "Users can update their own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete their own meals" ON meals;

CREATE POLICY "Users can view meals from their families"
  ON meals FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
    )
  );

CREATE POLICY "Users with write permission can insert meals"
  ON meals FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

CREATE POLICY "Users with write permission can update meals"
  ON meals FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

CREATE POLICY "Users with write permission can delete meals"
  ON meals FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

-- Update policies for weekly_plans table (replace existing policies)
DROP POLICY IF EXISTS "Users can view their own plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can insert their own plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON weekly_plans;

CREATE POLICY "Users can view plans from their families"
  ON weekly_plans FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
    )
  );

CREATE POLICY "Users with write permission can insert plans"
  ON weekly_plans FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

CREATE POLICY "Users with write permission can update plans"
  ON weekly_plans FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

CREATE POLICY "Users with write permission can delete plans"
  ON weekly_plans FOR DELETE
  USING (
    family_id IN (
      SELECT family_id FROM family_members
      WHERE clerk_user_id = auth.uid()
        AND (role = 'admin' OR permissions = 'write')
    )
  );

