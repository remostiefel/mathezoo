import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function resetPasswords() {
  console.log('🔑 Resetting passwords for Melv and Cher...\n');

  try {
    // Hash the new passwords
    const melvPasswordHash = await bcrypt.hash('Melv2025', 10);
    const cherPasswordHash = await bcrypt.hash('Cher2025', 10);

    // Update Melv's password
    const melvResult = await db
      .update(users)
      .set({ password: melvPasswordHash })
      .where(eq(users.username, 'Melv'))
      .returning();

    if (melvResult.length > 0) {
      console.log('✅ Melv password set to: Melv2025');
    } else {
      console.log('⚠️  Melv user not found');
    }

    // Update Cher's password
    const cherResult = await db
      .update(users)
      .set({ password: cherPasswordHash })
      .where(eq(users.username, 'Cher'))
      .returning();

    if (cherResult.length > 0) {
      console.log('✅ Cher password set to: Cher2025');
    } else {
      console.log('⚠️  Cher user not found');
    }

    console.log('\n🎉 Passwords updated successfully!');
    console.log('\nYou can now login with:');
    console.log('  Username: Melv, Password: Melv2025');
    console.log('  Username: Cher, Password: Cher2025');

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    throw error;
  }

  process.exit(0);
}

resetPasswords();
