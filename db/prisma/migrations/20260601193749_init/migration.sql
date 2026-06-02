-- CreateTable
CREATE TABLE "pokemon" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "evolution_id" INTEGER,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "current_pokemon_id" INTEGER,
    "is_egg" BOOLEAN NOT NULL DEFAULT true,
    "happiness" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hatched_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_backgrounds" (
    "id" SERIAL NOT NULL,
    "weather_type" TEXT NOT NULL,
    "time_of_day" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "environment_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "user_id" INTEGER NOT NULL,
    "total_logins" INTEGER NOT NULL DEFAULT 0,
    "total_happiness_gained" INTEGER NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "environment_backgrounds_weather_type_time_of_day_key" ON "environment_backgrounds"("weather_type", "time_of_day");

-- AddForeignKey
ALTER TABLE "pokemon" ADD CONSTRAINT "pokemon_evolution_id_fkey" FOREIGN KEY ("evolution_id") REFERENCES "pokemon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_current_pokemon_id_fkey" FOREIGN KEY ("current_pokemon_id") REFERENCES "pokemon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
