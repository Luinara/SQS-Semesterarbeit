import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
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

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });