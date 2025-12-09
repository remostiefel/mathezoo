import 'dotenv/config';
import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seed() {
    console.log(" Hashing password...");
    const hashedPassword = await bcrypt.hash("2020", 10);

    console.log("Creating admin user 'Stie'...");
    try {
        await db.insert(users).values({
            username: "Stie",
            password: hashedPassword,
            role: "admin",
            firstName: "Admin",
            lastName: "Stie"
        });
        console.log("✅ Admin user 'Stie' created successfully.");
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    }
    process.exit(0);
}

seed();
