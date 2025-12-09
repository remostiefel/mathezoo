
import { db } from './db';
import { learningProgression } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function giveTestCoins() {
  try {
    const userId = '17f3233a-cf51-4a81-aa5b-b87a099b60d3'; // Anna's user ID
    const coinsToAdd = 200; // Gebe 200 Test-Münzen
    
    console.log(`💰 Gebe ${coinsToAdd} Test-Münzen an User ${userId}...`);
    
    // Hole aktuelle Progression
    const progression = await db.query.learningProgression.findFirst({
      where: eq(learningProgression.userId, userId),
    });
    
    if (!progression) {
      console.error('❌ User progression nicht gefunden!');
      process.exit(1);
    }
    
    const currentCoins = progression.gameCoins ?? 0;
    const newCoins = currentCoins + coinsToAdd;
    
    // Update coins
    await db.update(learningProgression)
      .set({ gameCoins: newCoins })
      .where(eq(learningProgression.userId, userId));
    
    console.log(`✅ Erfolgreich! ${currentCoins} + ${coinsToAdd} = ${newCoins} Münzen`);
    console.log(`🎉 Du kannst jetzt im Shop einkaufen!`);
  } catch (error) {
    console.error('❌ Fehler beim Hinzufügen der Münzen:', error);
    throw error;
  }
}

giveTestCoins().then(() => process.exit(0));
