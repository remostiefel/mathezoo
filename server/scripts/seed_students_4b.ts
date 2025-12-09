
import "dotenv/config";
import { db } from '../db';
import { users, classes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// HARDCODE DB URL IF MISSING (for seed script resilience)
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgres://neondb_owner:npg_Q0qFz4sHjOco@ep-cool-glitter-a8ob638f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
}

async function seedStudents4b() {
    console.log('🚀 Starting seed for 4b students...');

    const studentNames = [
        "Azia", "Carina", "Delia", "Dias", "Elias", "Fatima",
        "Ferzan", "Fynn", "Gabriel", "John", "Leandro", "Lorian",
        "Maya", "Melissa", "Mykhailo", "Niharika", "Santiago",
        "Oleksandr", "Sebastian", "Severina", "Soraya", "Summer"
    ];

    const className = '4b';
    const passwordRaw = 'Leo25';

    try {
        // 1. Get Class 4b
        const classRecord = await db.query.classes.findFirst({
            where: eq(classes.name, className)
        });

        if (!classRecord) {
            console.error(`❌ Class ${className} not found! Please run the teacher seed script first.`);
            process.exit(1);
        }

        console.log(`✅ Found class ${className} (ID: ${classRecord.id})`);

        // 2. Create/Update Students
        const hashedPassword = await bcrypt.hash(passwordRaw, 10);

        for (const name of studentNames) {
            // Check if user exists
            const existingUser = await db.query.users.findFirst({
                where: eq(users.username, name)
            });

            if (existingUser) {
                console.log(`🔄 Updating student ${name}...`);
                await db.update(users).set({
                    password: hashedPassword,
                    role: 'student',
                    classId: classRecord.id,
                    firstName: name
                }).where(eq(users.id, existingUser.id));
            } else {
                console.log(`➕ Creating student ${name}...`);
                await db.insert(users).values({
                    username: name,
                    password: hashedPassword,
                    firstName: name,
                    role: 'student',
                    classId: classRecord.id
                });
            }
        }

        console.log(`✅ Successfully seeded ${studentNames.length} students for class ${className}!`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

seedStudents4b();
