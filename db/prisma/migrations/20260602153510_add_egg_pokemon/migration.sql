-- AlterTable
ALTER TABLE "users" ADD COLUMN     "egg_pokemon_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_egg_pokemon_id_fkey" FOREIGN KEY ("egg_pokemon_id") REFERENCES "pokemon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
