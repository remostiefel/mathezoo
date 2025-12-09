
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function resetProfiPassword() {
  console.log('🔐 Resetting Profi password...');

  try {
    const profiPassword = process.env.PROFI_PASSWORD || 'Leo25';
    const hashedPassword = await bcrypt.hash(profiPassword, 10);

    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, 'Profi'))
      .returning();

    if (result.length === 0) {
      console.log('❌ Profi user not found. Run setupAccounts.ts first.');
      process.exit(1);
    }

    console.log('✅ Profi password reset successfully');
    console.log(`   Username: Profi`);
    console.log(`   Password: ${profiPassword}`);

  } catch (error) {
    console.error('❌ Error resetting Profi password:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  resetProfiPassword().then(() => process.exit(0));
}

export { resetProfiPassword };
