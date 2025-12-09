
import { db } from "./db";
import { learningProgression, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function setupProfiToLevel75() {
  console.log("🚀 Setting up Profi at Level 75 for ZR100 testing...");
  
  try {
    // Find or create Profi
    let profi = await db
      .select()
      .from(users)
      .where(eq(users.username, "Profi"))
      .then(rows => rows[0]);

    if (!profi) {
      console.log("❌ Profi not found - creating user now...");
      
      const profiPassword = process.env.PROFI_PASSWORD || 'Leo25';
      const hashedPassword = await bcrypt.hash(profiPassword, 10);
      
      const [newProfi] = await db.insert(users).values({
        username: "Profi",
        password: hashedPassword,
        firstName: "Profi",
        role: "student",
        classId: null,
      }).returning();
      
      profi = newProfi;
      console.log(`✓ Created Profi user (${profi.id})`);
    } else {
      console.log(`✓ Found Profi (${profi.id})`);
    }

    const targetLevel = 75;
    const targetStage = 13; // Level 75 = Stage 13

    // Create progression for Profi
    const profiProgression = await db
      .select()
      .from(learningProgression)
      .where(eq(learningProgression.userId, profi.id))
      .then(rows => rows[0]);

    // Build level history: All levels 1-74 mastered, Level 75 active
    const levelHistory = [];
    for (let i = 1; i <= 75; i++) {
      levelHistory.push({
        level: i,
        attemptsCount: i < 75 ? 10 : 0,
        correctCount: i < 75 ? 10 : 0,
        masteredAt: i < 75 ? new Date().toISOString() : null,
        unlockedAt: new Date().toISOString(),
        totalAttempts: i < 75 ? 10 : 0,
        successRate: i < 75 ? 1.0 : 0,
        averageTime: 5,
        lastAttemptAt: i < 75 ? new Date().toISOString() : null,
      });
    }

    if (!profiProgression) {
      // Create new progression
      await db.insert(learningProgression).values({
        userId: profi.id,
        currentStage: targetStage,
        currentLevel: targetLevel,
        stageHistory: [],
        levelHistory: levelHistory,
        milestones: [],
        currentStreak: 0,
        totalTasksSolved: 740, // 10 tasks per level * 74 levels
        totalCorrect: 740,
        knowledgeGaps: [],
        dailyStats: {},
        lastActivityAt: new Date(),
        taskMastery: {},
        competencyProgress: {},
        representationLevel: 2, // Geringe Unterstützung für Experten
      });
      console.log(`✓ Created progression for Profi at Level ${targetLevel}`);
    } else {
      // Update existing progression
      await db
        .update(learningProgression)
        .set({
          currentStage: targetStage,
          currentLevel: targetLevel,
          levelHistory: levelHistory,
          totalTasksSolved: 740,
          totalCorrect: 740,
          currentStreak: 0,
          representationLevel: 2,
        })
        .where(eq(learningProgression.userId, profi.id));
      console.log(`✓ Updated Profi to Level ${targetLevel} (Stage ${targetStage})`);
    }

    const password = process.env.PROFI_PASSWORD || 'Leo25';
    
    console.log("\n🎉 Profi is ready for ZR100 testing!");
    console.log(`   Login: Profi`);
    console.log(`   Password: ${password}`);
    console.log(`   Level: ${targetLevel} (Stage ${targetStage})`);
    console.log(`   Tasks solved: 740`);
    console.log(`   Next tasks will be in ZR100 range`);

  } catch (error) {
    console.error('❌ Error setting up Profi:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProfiToLevel75().then(() => process.exit(0));
}

export { setupProfiToLevel75 };
