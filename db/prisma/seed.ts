import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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

    await prisma.environmentBackground.upsert({
        where: {
            weatherType_timeOfDay: {
                weatherType: "sunny",
                timeOfDay: "day",
            },
        },
        update: {},
        create: {
            weatherType: "sunny",
            timeOfDay: "day",
            imageUrl: "/backgrounds/sunny_day.png",
        },
    });

    console.log("Seed completed: testuser and sunny_day background created.");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });