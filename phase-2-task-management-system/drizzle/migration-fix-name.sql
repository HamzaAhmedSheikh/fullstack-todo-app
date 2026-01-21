-- First, update any existing users with NULL name to have a default name
UPDATE "users" SET "name" = COALESCE("name", SPLIT_PART(email, '@', 1)) WHERE "name" IS NULL;

-- Then, alter the column to be NOT NULL
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
