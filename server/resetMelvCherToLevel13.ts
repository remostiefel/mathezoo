
import { db } from "./db";
import { learningProgression, users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function resetMelvCherToLevel13() {
  console.log("🔧 Resetting Melv and Cher to Level 13 with 0/10...");
  
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

    // Level 13 entspricht Stage 13
    const targetLevel = 13;
    const targetStage = 13;

    // Reset Melv
    const melvProgression = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, melv.id))
      .then(rows => rows[0]);

    if (melvProgression) {
      // Update stage history for stage 13
      const stageHistory = (melvProgression.stageHistory as any[]) || [];
      const updatedHistory = stageHistory.filter((s: any) => s.stageNumber !== targetStage);
      
      updatedHistory.push({
        stageNumber: targetStage,
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
          currentStage: targetStage,
          currentLevel: targetLevel,
          stageHistory: updatedHistory as any,
          currentStreak: 0,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, melv.id));

      console.log(`✅ Melv reset to Level 13 (Stage 13) with 0/10`);
    }

    // Reset Cher
    const cherProgression = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, cher.id))
      .then(rows => rows[0]);

    if (cherProgression) {
      // Update stage history for stage 13
      const stageHistory = (cherProgression.stageHistory as any[]) || [];
      const updatedHistory = stageHistory.filter((s: any) => s.stageNumber !== targetStage);
      
      updatedHistory.push({
        stageNumber: targetStage,
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
          currentStage: targetStage,
          currentLevel: targetLevel,
          stageHistory: updatedHistory as any,
          currentStreak: 0,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, cher.id));

      console.log(`✅ Cher reset to Level 13 (Stage 13) with 0/10`);
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
  resetMelvCherToLevel13()
    .then(() => {
      console.log("✨ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { resetMelvCherToLevel13 };
