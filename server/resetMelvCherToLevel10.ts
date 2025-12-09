
import { db } from "./db";
import { learningProgression, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function resetMelvCherToLevel10() {
  console.log("🔧 Resetting Melv and Cher to Level 10 with 0/10...");
  
  try {
    // Find Melv and Cher
    const melv = await db
      .select()
      .from(users)
      .where(eq(users.username, "Melv"))
      .then(rows => rows[0]);

    const cher = await db
      .select()
      .from(users)
      .where(eq(users.username, "Cher"))
      .then(rows => rows[0]);

    if (!melv) {
      console.log("❌ Melv not found");
      return;
    }

    if (!cher) {
      console.log("❌ Cher not found");
      return;
    }

    console.log(`✓ Found Melv (${melv.id})`);
    console.log(`✓ Found Cher (${cher.id})`);

    const targetLevel = 10;

    // Reset Melv
    const melvProgression = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, melv.id))
      .then(rows => rows[0]);

    if (melvProgression) {
      // Create fresh level history starting at level 10
      const levelHistory = [];
      
      // Add levels 1-9 as mastered
      for (let i = 1; i < targetLevel; i++) {
        levelHistory.push({
          level: i,
          unlockedAt: new Date().toISOString(),
          masteredAt: new Date().toISOString(),
          attemptsCount: 10,
          correctCount: 10,
          totalAttempts: 10,
          successRate: 100,
          averageTime: 5,
          lastAttemptAt: new Date().toISOString(),
        });
      }

      // Add level 10 as current (not mastered, 0/10)
      levelHistory.push({
        level: targetLevel,
        unlockedAt: new Date().toISOString(),
        masteredAt: null,
        attemptsCount: 0,
        correctCount: 0,
        totalAttempts: 0,
        successRate: 0,
        averageTime: 0,
        lastAttemptAt: new Date().toISOString(),
      });

      await db
        .update(learningProgression)
        .set({
          currentLevel: targetLevel,
          levelHistory: levelHistory as any,
          currentStreak: 0,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, melv.id));

      console.log(`✅ Melv reset to Level 10 with 0/10`);
    }

    // Reset Cher
    const cherProgression = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, cher.id))
      .then(rows => rows[0]);

    if (cherProgression) {
      // Create fresh level history starting at level 10
      const levelHistory = [];
      
      // Add levels 1-9 as mastered
      for (let i = 1; i < targetLevel; i++) {
        levelHistory.push({
          level: i,
          unlockedAt: new Date().toISOString(),
          masteredAt: new Date().toISOString(),
          attemptsCount: 10,
          correctCount: 10,
          totalAttempts: 10,
          successRate: 100,
          averageTime: 5,
          lastAttemptAt: new Date().toISOString(),
        });
      }

      // Add level 10 as current (not mastered, 0/10)
      levelHistory.push({
        level: targetLevel,
        unlockedAt: new Date().toISOString(),
        masteredAt: null,
        attemptsCount: 0,
        correctCount: 0,
        totalAttempts: 0,
        successRate: 0,
        averageTime: 0,
        lastAttemptAt: new Date().toISOString(),
      });

      await db
        .update(learningProgression)
        .set({
          currentLevel: targetLevel,
          levelHistory: levelHistory as any,
          currentStreak: 0,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, cher.id));

      console.log(`✅ Cher reset to Level 10 with 0/10`);
    }

    console.log("\n✨ Reset complete!");
    
  } catch (error) {
    console.error("❌ Error resetting:", error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  resetMelvCherToLevel10()
    .then(() => {
      console.log("✨ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { resetMelvCherToLevel10 };
