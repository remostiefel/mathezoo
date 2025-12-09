import { authService } from './authService';
import { storage } from './storage';
import { db } from './db';
import { classes } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function setupAccounts() {
  console.log('🔐 Setting up Mathemat accounts...');

  // SECURITY: Require explicit password configuration - no fallbacks
  if (!process.env.DEFAULT_STUDENT_PASSWORD) {
    throw new Error('SECURITY ERROR: DEFAULT_STUDENT_PASSWORD environment variable must be set. No default passwords allowed.');
  }
  if (!process.env.MELV_PASSWORD) {
    throw new Error('SECURITY ERROR: MELV_PASSWORD environment variable must be set. No default passwords allowed.');
  }
  if (!process.env.CHER_PASSWORD) {
    throw new Error('SECURITY ERROR: CHER_PASSWORD environment variable must be set. No default passwords allowed.');
  }

  const DEFAULT_PASSWORD = process.env.DEFAULT_STUDENT_PASSWORD;
  const MELV_PASSWORD = process.env.MELV_PASSWORD;
  const CHER_PASSWORD = process.env.CHER_PASSWORD;

  console.log('✅ All required password environment variables are set');

  try {
    // Create Classes
    const [class4a] = await db.insert(classes).values({
      name: '4a',
      teacherId: 'temp',
    }).returning();
    console.log('✓ Created class 4a');

    const [class4b] = await db.insert(classes).values({
      name: '4b',
      teacherId: 'temp',
    }).returning();
    console.log('✓ Created class 4b');

    const [class4c] = await db.insert(classes).values({
      name: '4c',
      teacherId: 'temp',
    }).returning();
    console.log('✓ Created class 4c');

    const [class4e] = await db.insert(classes).values({
      name: '4e',
      teacherId: 'temp',
    }).returning();
    console.log('✓ Created class 4e');

    const [class5s] = await db.insert(classes).values({
      name: '5s',
      teacherId: 'temp',
    }).returning();
    console.log('✓ Created class 5s');

    // Create Teachers
    const teacherStie = await authService.createUser({
      username: 'Stie',
      password: DEFAULT_PASSWORD,
      firstName: 'Stie',
      role: 'admin',
    });
    console.log('✓ Created teacher Stie (admin)');

    const teacherSimo = await authService.createUser({
      username: 'Simo',
      password: DEFAULT_PASSWORD,
      firstName: 'Simo',
      role: 'admin',
    });
    console.log('✓ Created teacher Simo (admin)');

    const teacherRast = await authService.createUser({
      username: 'Rast',
      password: DEFAULT_PASSWORD,
      firstName: 'Rast',
      role: 'admin',
    });
    console.log('✓ Created teacher Rast (admin)');

    // Update class teachers (Stie for all, Rast also for 4b)
    await db.update(classes)
      .set({ teacherId: teacherStie.id })
      .where(eq(classes.id, class4a.id));

    await db.update(classes)
      .set({ teacherId: teacherStie.id })
      .where(eq(classes.id, class4b.id));

    await db.update(classes)
      .set({ teacherId: teacherStie.id })
      .where(eq(classes.id, class4c.id));

    await db.update(classes)
      .set({ teacherId: teacherStie.id })
      .where(eq(classes.id, class4e.id));

    await db.update(classes)
      .set({ teacherId: teacherStie.id })
      .where(eq(classes.id, class5s.id));

    // Create Students for Class 4a
    const class4aStudents = ['Alisja', 'Andrin', 'Asmin', 'Bilal', 'Celina', 'Laurent', 'Tiara'];
    for (const studentName of class4aStudents) {
      await authService.createUser({
        username: studentName,
        password: DEFAULT_PASSWORD,
        firstName: studentName,
        role: 'student',
        classId: class4a.id,
      });
      console.log(`✓ Created student ${studentName} (class 4a)`);
    }

    // Create Students for Class 4b
    const class4bStudents = ['Azia', 'Delia', 'Dias', 'Fynn', 'John', 'Lorian', 'Miki', 'Sascha', 'Soraya'];
    for (const studentName of class4bStudents) {
      await authService.createUser({
        username: studentName,
        password: DEFAULT_PASSWORD,
        firstName: studentName,
        role: 'student',
        classId: class4b.id,
      });
      console.log(`✓ Created student ${studentName} (class 4b)`);
    }

    // Create Students for Class 4c
    const class4cStudents = ['Davi', 'Etika', 'Jahir', 'Naila', 'Renas'];
    for (const studentName of class4cStudents) {
      await authService.createUser({
        username: studentName,
        password: DEFAULT_PASSWORD,
        firstName: studentName,
        role: 'student',
        classId: class4c.id,
      });
      console.log(`✓ Created student ${studentName} (class 4c)`);
    }

    // Create Students for Class 4e
    const class4eStudents = ['Alina', 'Berzan', 'Carolina', 'Chanel', 'David', 'Joshua', 'Leandra', 'Leonardo', 'Melisa', 'Mila', 'Mohammed', 'Suara'];
    for (const studentName of class4eStudents) {
      await authService.createUser({
        username: studentName,
        password: DEFAULT_PASSWORD,
        firstName: studentName,
        role: 'student',
        classId: class4e.id,
      });
      console.log(`✓ Created student ${studentName} (class 4e)`);
    }

    // Create Students for Class 5s - Melv and Cher have individual passwords
    await authService.createUser({
      username: 'Melv',
      password: MELV_PASSWORD,
      firstName: 'Melv',
      role: 'student',
      classId: class5s.id,
    });
    console.log(`✓ Created student Melv (class 5s)`);

    await authService.createUser({
      username: 'Cher',
      password: CHER_PASSWORD,
      firstName: 'Cher',
      role: 'student',
      classId: class5s.id,
    });
    console.log(`✓ Created student Cher (class 5s)`);

    // Testuser Profi für ZR100-Testing
    const profiPassword = process.env.PROFI_PASSWORD || 'Leo25';
    await authService.createUser({
      username: 'Profi',
      password: profiPassword,
      firstName: 'Profi',
      role: 'student',
      classId: class5s.id,
    });
    console.log(`✓ Created test student Profi (class 5s, ZR100 testing)`);

    console.log('\n🎉 All accounts created successfully!');
    console.log('\nTeacher Logins:');
    console.log('  Stie (Admin, all classes)');
    console.log('  Simo (Admin)');
    console.log('  Rast (Admin, class 4b)');
    console.log('  Password: Set via DEFAULT_STUDENT_PASSWORD env var');
    console.log('\nStudent Logins:');
    console.log('  Standard password: Set via DEFAULT_STUDENT_PASSWORD env var');
    console.log('  Special passwords: MELV_PASSWORD and CHER_PASSWORD env vars');
    console.log('\nClass 4a (' + class4aStudents.length + ' students):');
    console.log('  ' + class4aStudents.join(', '));
    console.log('\nClass 4b (' + class4bStudents.length + ' students):');
    console.log('  ' + class4bStudents.join(', '));
    console.log('\nClass 4c (' + class4cStudents.length + ' students):');
    console.log('  ' + class4cStudents.join(', '));
    console.log('\nClass 4e (' + class4eStudents.length + ' students):');
    console.log('  ' + class4eStudents.join(', '));
    console.log('\nClass 5s (2 students):');
    console.log('  Melv, Cher');

  } catch (error) {
    console.error('Error setting up accounts:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAccounts().then(() => process.exit(0));
}

export { setupAccounts };