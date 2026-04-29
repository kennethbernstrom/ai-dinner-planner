-- Migration: Make day_of_week optional in plan_meals table
-- This allows meals to be added to plans without immediately assigning a specific day
-- Useful for creating shopping lists before scheduling meals

-- Step 1: Drop the unique constraint that includes day_of_week
-- (This constraint prevents multiple meals with null day_of_week)
ALTER TABLE plan_meals DROP CONSTRAINT IF EXISTS plan_meals_plan_id_day_of_week_meal_slot_key;

-- Step 2: Make day_of_week nullable
ALTER TABLE plan_meals ALTER COLUMN day_of_week DROP NOT NULL;

-- Step 3: Add a new index (instead of unique constraint) for performance
-- Note: This replaces the unique constraint with a regular index
CREATE INDEX IF NOT EXISTS idx_plan_meals_plan_day_slot ON plan_meals(plan_id, day_of_week, meal_slot);

-- Optional: Add a comment to the column to document the change
COMMENT ON COLUMN plan_meals.day_of_week IS '0-6 (Monday-Sunday), null if not yet scheduled to a specific day';

