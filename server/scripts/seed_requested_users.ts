import "dotenv/config";
import { db } from '../db';
import { users, classes, classTeachers } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// HARDCODE DB URL IF MISSING (for seed script resilience)
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgres://neondb_owner:npg_Q0qFz4sHjOco@ep-cool-glitter-a8ob638f-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
}

async function seedRequestedUsers() {
    console.log('🚀 Starting custom seed for requested teachers...');

    const teachers = [
        { class: '4a', name: 'Ibrahimovic', pass: '2021' },
        { class: '4b', name: 'Rast', pass: '2022' },
        { class: '4c', name: 'Aridag', pass: '2023' },
        { class: '4e', name: 'Jahiji', pass: '2025' },
        { class: '6a', name: 'Bobot', pass: '2021' },
        { class: '6a', name: 'Muepu', pass: '2021' }, // Muepu also for 6a
    ];

    const admins = [
        { name: 'Stiefel', pass: '2020' }
    ];

    try {
        // 1. Create Admins
        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.pass, 10);

            const existing = await db.select().from(users).where(eq(users.username, admin.name)).limit(1);

            if (existing.length > 0) {
                console.log(`🔄 Updating admin ${admin.name}...`);
                await db.update(users).set({
                    password: hashedPassword,
                    role: 'admin'
                }).where(eq(users.id, existing[0].id));
            } else {
                console.log(`➕ Creating admin ${admin.name}...`);
                await db.insert(users).values({
                    username: admin.name,
                    password: hashedPassword,
                    firstName: admin.name,
                    role: 'admin'
                });
            }
        }

        // 2. Create Teachers & Classes
        for (const t of teachers) {
            const hashedPassword = await bcrypt.hash(t.pass, 10);

            // Upsert User
            let teacherId;
            const existingUser = await db.select().from(users).where(eq(users.username, t.name)).limit(1);

            if (existingUser.length > 0) {
                console.log(`🔄 Updating teacher ${t.name}...`);
                await db.update(users).set({
                    password: hashedPassword,
                    role: 'teacher'
                }).where(eq(users.id, existingUser[0].id));
                teacherId = existingUser[0].id;
            } else {
                console.log(`➕ Creating teacher ${t.name}...`);
                const [newUser] = await db.insert(users).values({
                    username: t.name,
                    password: hashedPassword,
                    firstName: t.name,
                    role: 'teacher'
                }).returning();
                teacherId = newUser.id;
            }

            // Upsert Class
            if (t.class) {
                const existingClass = await db.select().from(classes).where(eq(classes.name, t.class)).limit(1);

                if (existingClass.length > 0) {
                    console.log(`  Example class ${t.class} already exists...`);
                    const classId = existingClass[0].id;

                    // Add to class_teachers join table
                    console.log(`  🔗 Assigning ${t.name} to ${t.class} via class_teachers...`);
                    await db.insert(classTeachers).values({
                        classId: classId,
                        teacherId: teacherId
                    }).onConflictDoNothing();

                } else {
                    console.log(`  ➕ Creating class ${t.class}...`);
                    const [newClass] = await db.insert(classes).values({
                        name: t.class,
                        teacherId: teacherId
                    }).returning();

                    // Add self to class_teachers
                    await db.insert(classTeachers).values({
                        classId: newClass.id,
                        teacherId: teacherId
                    });
                }
            }
        }

        console.log('✅ Done!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed:', err);
        process.exit(1);
    }
}

seedRequestedUsers();
