
-- Add lastLoginAt column to learningProgression table for idle economy system
ALTER TABLE "learning_progression" 
ADD COLUMN IF NOT EXISTS "last_login_at" timestamp DEFAULT now();

-- Set initial value for existing rows to their created_at timestamp
UPDATE "learning_progression" 
SET "last_login_at" = "created_at" 
WHERE "last_login_at" IS NULL;
