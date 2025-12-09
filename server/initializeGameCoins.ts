
import { db } from './db';
import { learningProgression } from '@shared/schema';
import { isNull, eq } from 'drizzle-orm';

async function initializeGameCoins() {
  try {
    console.log('🪙 Initializing game coins for users...');
    
    // Find all progressions where gameCoins is null
    const progressions = await db.query.learningProgression.findMany({
      where: isNull(learningProgression.gameCoins),
    });
    
    console.log(`Found ${progressions.length} users with null gameCoins`);
    
    for (const prog of progressions) {
      await db.update(learningProgression)
        .set({ gameCoins: 0 })
        .where(eq(learningProgression.id, prog.id));
      
      console.log(`✅ Initialized gameCoins for user ${prog.userId}`);
    }
    
    console.log('🎉 Game coins initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing game coins:', error);
    throw error;
  }
}

initializeGameCoins().then(() => process.exit(0));
