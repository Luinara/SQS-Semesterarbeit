ALTER TABLE "user_stats"
    DROP CONSTRAINT IF EXISTS "user_stats_user_id_fkey";

ALTER TABLE "user_stats"
    ADD CONSTRAINT "user_stats_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_tasks"
    DROP CONSTRAINT IF EXISTS "user_tasks_user_id_fkey";

ALTER TABLE "user_tasks"
    ADD CONSTRAINT "user_tasks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
