
import "dotenv/config";
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// HARDCODE DB URL IF MISSING (for seed script resilience)
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgres://neondb_owner:npg_Q0qFz4sHjOco@ep-cool-glitter-a8ob638f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
}

async function fixStudentNames() {
    console.log('🚀 Starting student name correction for 4b...');

    const corrections = [
        { oldName: "Mykhailo", newName: "Miki" },
        { oldName: "Oleksandr", newName: "Sascha" }
    ];

    try {
        for (const correction of corrections) {
            const user = await db.query.users.findFirst({
                where: eq(users.username, correction.oldName)
            });

            if (!user) {
                console.log(`⚠️ User '${correction.oldName}' not found.`);

                // Check if already renamed
                const alreadyNew = await db.query.users.findFirst({
                    where: eq(users.username, correction.newName)
                });
                if (alreadyNew) {
                    console.log(`   User '${correction.newName}' already exists. Assume corrected.`);
                }
                continue;
            }

            console.log(`🔄 Renaming '${correction.oldName}' to '${correction.newName}'...`);
            await db.update(users).set({
                username: correction.newName,
                firstName: correction.newName
            }).where(eq(users.id, user.id));
        }

        console.log('✅ Name corrections completed!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

fixStudentNames();
