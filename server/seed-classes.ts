import 'dotenv/config';
import { db } from './db';
import { classes, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedClasses() {
    console.log("🔍 Finding admin user 'Stie'...");
    const adminUser = await db.query.users.findFirst({
        where: eq(users.username, "Stie")
    });

    if (!adminUser) {
        console.error("❌ Admin user 'Stie' not found. Please run the admin seed script first.");
        process.exit(1);
    }

    const classNames = ["Testklasse", "4a", "4b", "4c", "4d", "4e", "6a"];

    console.log(`📝 Seeding ${classNames.length} classes for teacher ${adminUser.username}...`);

    try {
        for (const name of classNames) {
            await db.insert(classes).values({
                name,
                teacherId: adminUser.id
            });
            console.log(`   - Created class: ${name}`);
        }
        console.log("✅ All classes created successfully.");
    } catch (error) {
        console.error("❌ Error seeding classes:", error);
    }
    process.exit(0);
}

seedClasses();
