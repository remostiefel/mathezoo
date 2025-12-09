/**
 * Setup Script: Create Teacher, Classes, and Students
 * 
 * Creates:
 * - Teacher account
 * - Classes: 4a, 4b, 4c, 4e
 * - All students from PDF with password "Leo25"
 * - Learning progression for each student
 */

import bcrypt from 'bcrypt';
import { db } from './db';
import { users, classes, learningProgression } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Class data from PDF
const classData = {
  '4a': ['Alisja', 'Andrin', 'Asmin', 'Celina', 'Tiara', 'Bilal', 'Laurent'],
  '4b': ['Azia', 'Delia', 'Dias', 'Fynn', 'John', 'Lorian', 'Miki', 'Sascha', 'Soraya'],
  '4c': ['Davi', 'Jahir', 'Naila', 'Renas', 'Etika'],
  '4e': ['Alina', 'Berzan', 'Carolina', 'Chanel', 'David', 'Joshua', 'Leandra', 'Leonardo', 'Melisa', 'Mila', 'Mohammed', 'Suara']
};

const STUDENT_PASSWORD = 'Leo25';
const TEACHER_USERNAME = 'lehrer';
const TEACHER_PASSWORD = 'Leo25';

async function setupClasses() {
  console.log('\n═══════════════════════════════════════');
  console.log('🚀 STARTING CLASS SETUP');
  console.log('═══════════════════════════════════════\n');

  try {
    // 1. Create teacher account
    console.log('👨‍🏫 Creating teacher account...');
    const hashedTeacherPassword = await bcrypt.hash(TEACHER_PASSWORD, 10);

    const [teacher] = await db.insert(users).values({
      username: TEACHER_USERNAME,
      password: hashedTeacherPassword,
      firstName: 'Lehrer',
      role: 'admin'
    }).returning();

    console.log(`✅ Teacher created: ${TEACHER_USERNAME}\n`);

    // 2. Create classes and students
    let totalStudents = 0;

    for (const [className, studentNames] of Object.entries(classData)) {
      console.log(`📚 Setting up class ${className}...`);

      // Create class
      const [classRecord] = await db.insert(classes).values({
        name: className,
        teacherId: teacher.id
      }).returning();

      console.log(`  ✓ Class ${className} created`);

      // Create students for this class
      for (const studentName of studentNames) {
        try {
          const username = `${studentName.toLowerCase()}_${className}`;
          const hashedPassword = await bcrypt.hash(STUDENT_PASSWORD, 10);

          const [student] = await db.insert(users).values({
            username,
            password: hashedPassword,
            firstName: studentName,
            role: 'student',
            classId: classRecord.id
          }).returning();

          // Create learning progression for student
          await db.insert(learningProgression).values({
            userId: student.id,
            currentLevel: 1
          });

          totalStudents++;
          console.log(`    ✓ ${studentName} (${username})`);
        } catch (error: any) {
          console.error(`    ✗ Error creating ${studentName}: ${error.message}`);
        }
      }

      console.log(`✅ Class ${className} complete: ${studentNames.length} students\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 SETUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`👨‍🏫 Teacher: ${TEACHER_USERNAME}`);
    console.log(`🔑 Teacher Password: ${TEACHER_PASSWORD}`);
    console.log(`📚 Classes created: ${Object.keys(classData).length}`);
    console.log(`👨‍🎓 Total students: ${totalStudents}`);
    console.log(`🔐 Student password: ${STUDENT_PASSWORD}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📋 Login Examples:');
    console.log(`  Teacher: username="${TEACHER_USERNAME}", password="${TEACHER_PASSWORD}"`);
    console.log(`  Student (4a): username="alisja_4a", password="${STUDENT_PASSWORD}"`);
    console.log(`  Student (4b): username="azia_4b", password="${STUDENT_PASSWORD}"`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupClasses();
}

export { setupClasses };