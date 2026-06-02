import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    await seedPokemon();
    const passwordHash = await bcrypt.hash("test123", 10);

    await prisma.user.upsert({
        where: { username: "testuser" },
        update: {},
        create: {
            username: "testuser",
            passwordHash,
            isEgg: true,
            happiness: 0,
            stats: {
                create: {
                    totalLogins: 0,
                    totalHappinessGained: 0,
                },
            },
        },
    });

    const backgrounds = [
        "sunny",
        "cloudy",
        "rain",
        "thunderstorm",
        "snow",
        "fog",
        "windy",
        "clear",
    ];

    for (const weatherType of backgrounds) {
        for (const timeOfDay of ["day", "night"]) {
            await prisma.environmentBackground.upsert({
                where: {
                    weatherType_timeOfDay: {
                        weatherType,
                        timeOfDay,
                    },
                },
                update: {},
                create: {
                    weatherType,
                    timeOfDay,
                    imageUrl: `/backgrounds/${weatherType}_${timeOfDay}.png`,
                },
            });
        }
    }

    console.log("Seed completed");
}

async function seedPokemon() {
    console.log("Loading Pokemon...");

    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    const data = await response.json();

    for (const entry of data.results) {
        const pokemonResponse = await fetch(entry.url);
        const pokemonData = await pokemonResponse.json();

        await prisma.pokemon.upsert({
            where: {
                id: pokemonData.id,
            },
            update: {
                name: pokemonData.name,
                imageUrl: pokemonData.sprites.other["official-artwork"].front_default,
            },
            create: {
                id: pokemonData.id,
                name: pokemonData.name,
                imageUrl: pokemonData.sprites.other["official-artwork"].front_default,
            },
        });

        console.log(`Saved ${pokemonData.id}: ${pokemonData.name}`);
    }

    console.log("Pokemon loaded.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });