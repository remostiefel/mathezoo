import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function resetAllStudentPasswords() {
  console.log('🔑 Setze Passwort "Leo25" für alle Schüler...\n');

  try {
    // Get all students
    const allStudents = await db
      .select()
      .from(users)
      .where(eq(users.role, 'student'));

    console.log(`Gefunden: ${allStudents.length} Schüler\n`);

    // Hash the password once
    const passwordHash = await bcrypt.hash('Leo25', 10);

    // Update all student passwords
    let updated = 0;
    for (const student of allStudents) {
      await db
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.id, student.id));
      
      console.log(`✅ ${student.username} (${student.firstName || student.username})`);
      updated++;
    }

    console.log(`\n🎉 ${updated} Schüler-Passwörter erfolgreich aktualisiert!`);
    console.log('\n📝 Alle Schüler können sich nun einloggen mit:');
    console.log('   Passwort: Leo25');

  } catch (error) {
    console.error('❌ Fehler beim Zurücksetzen der Passwörter:', error);
    throw error;
  }

  process.exit(0);
}

resetAllStudentPasswords();
