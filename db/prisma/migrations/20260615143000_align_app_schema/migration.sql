-- Align the migrated PostgreSQL schema with the current Prisma and Spring JPA models.

ALTER TABLE "pokemon"
    ADD COLUMN IF NOT EXISTS "evolution_stage" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "last_task_completion_date" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "pokemon_level" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS "pokemon_xp" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "last_level_up_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "hydration_ml" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "hunger" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pending_feed_points" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "version" BIGINT;

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "feed_points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tasks_title_key" ON "tasks"("title");

CREATE TABLE IF NOT EXISTS "user_tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_tasks_user_id_task_id_key" ON "user_tasks"("user_id", "task_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_tasks_user_id_fkey'
    ) THEN
        ALTER TABLE "user_tasks"
            ADD CONSTRAINT "user_tasks_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_tasks_task_id_fkey'
    ) THEN
        ALTER TABLE "user_tasks"
            ADD CONSTRAINT "user_tasks_task_id_fkey"
            FOREIGN KEY ("task_id") REFERENCES "tasks"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
