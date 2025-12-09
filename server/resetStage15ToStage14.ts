
import { db } from "./db";
import { learningProgression } from "@shared/schema";
import { sql, eq } from "drizzle-orm";

async function resetStage15ToStage14() {
  console.log("🔧 Resetting Stage 15 users to Stage 14...");
  
  try {
    // Find all progressions with stage 15
    const stage15Progressions = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.currentStage, 15));

    console.log(`Found ${stage15Progressions.length} users in Stage 15`);

    if (stage15Progressions.length === 0) {
      console.log("No users to reset.");
      return;
    }

    // Reset each user to stage 14
    for (const prog of stage15Progressions) {
      console.log(`Resetting user ${prog.userId} from Stage 15 to Stage 14`);
      
      // Update stage to 14
      await db
        .update(learningProgression)
        .set({ 
          currentStage: 14,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, prog.userId));

      // Also update stage history to reflect stage 14 as current
      const stageHistory = (prog.stageHistory as any[]) || [];
      
      // Remove stage 15 entry if exists
      const updatedHistory = stageHistory.filter((s: any) => s.stageNumber !== 15);
      
      // Ensure stage 14 exists
      if (!updatedHistory.find((s: any) => s.stageNumber === 14)) {
        updatedHistory.push({
          stageNumber: 14,
          unlockedAt: new Date().toISOString(),
          masteredAt: null,
          attemptsCount: 0,
          correctCount: 0,
          totalAttempts: 0,
          successRate: 0,
          averageTime: 0,
          lastAttemptAt: new Date().toISOString(),
        });
      }

      await db
        .update(learningProgression)
        .set({ 
          stageHistory: updatedHistory as any,
          updatedAt: new Date()
        })
        .where(eq(learningProgression.userId, prog.userId));
    }

    console.log(`✅ Successfully reset ${stage15Progressions.length} users from Stage 15 to Stage 14`);
    
    // Verify the changes
    const remainingStage15 = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.currentStage, 15));
    
    console.log(`Remaining users in Stage 15: ${remainingStage15.length}`);
    
  } catch (error) {
    console.error("❌ Error resetting stages:", error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  resetStage15ToStage14()
    .then(() => {
      console.log("✨ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { resetStage15ToStage14 };
