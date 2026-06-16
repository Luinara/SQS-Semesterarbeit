ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "last_daily_reset_at" TIMESTAMP(3);
