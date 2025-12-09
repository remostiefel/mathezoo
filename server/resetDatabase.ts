
import { db } from './db';
import { users, classes, tasks, learningSessions, achievements, cognitiveProfiles, learningProgressions } from '@shared/schema';
import { setupAccounts } from './setupAccounts';

async function resetDatabase() {
  console.log('🗑️  Resetting database...');

  try {
    // Delete all data from all tables (in correct order due to foreign keys)
    console.log('Deleting achievements...');
    await db.delete(achievements);
    
    console.log('Deleting tasks...');
    await db.delete(tasks);
    
    console.log('Deleting learning sessions...');
    await db.delete(learningSessions);
    
    console.log('Deleting learning progressions...');
    await db.delete(learningProgressions);
    
    console.log('Deleting cognitive profiles...');
    await db.delete(cognitiveProfiles);
    
    console.log('Deleting users...');
    await db.delete(users);
    
    console.log('Deleting classes...');
    await db.delete(classes);
    
    console.log('✅ Database cleared successfully!');
    console.log('\n📝 Setting up new accounts...\n');
    
    // Now setup accounts with new passwords
    await setupAccounts();
    
    console.log('\n✅ Database reset and accounts created successfully!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  resetDatabase()
    .then(() => {
      console.log('✨ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };
